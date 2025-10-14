import os
import hmac
import hashlib
from flask_restful import Resource, Api
from flask import request, current_app
from server.models.payment import Payment
from server.models.sale import Sale
from server.models.discount import Discount
from server.models.contract import Contract
from server.models.contract_template import ContractTemplate
from server.models.beat import Beat
from server.extension import db
from server.utils.contract_util import generate_contract_pdf
from . import purchase_resource

api = Api(purchase_resource)

PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY")


class PaystackWebhookResource(Resource):
    def post(self):
        signature = request.headers.get("x-paystack-signature")
        body = request.get_data()
        computed = hmac.new(PAYSTACK_SECRET_KEY.encode(), body, hashlib.sha512).hexdigest()

        if not signature or signature != computed:
            current_app.logger.warning("Invalid Paystack signature")
            return {"error": "Invalid signature"}, 400

        event = request.get_json(force=True)
        event_type = event.get("event")
        data = event.get("data", {})

        ref = data.get("reference")
        status = data.get("status")
        metadata = data.get("metadata", {}) or {}

       
        payment = None
        try:
            pid = metadata.get("payment_id")
            if pid:
                payment = Payment.query.get(int(pid))
        except Exception:
            payment = None

        if not payment and ref:
            payment = Payment.query.filter_by(transaction_ref=ref).first()

        if not payment:
            current_app.logger.warning("Payment not found for reference %s", ref)
            return {"ok": True}, 200

        if payment.status == "success":
            return {"ok": True}, 200

        if status in ("success", "successful"):
            payment.status = "success"
            db.session.add(payment)

            existing_sale = Sale.query.filter_by(
                buyer_id=payment.user_id,
                beat_id=payment.beat_id,
                soundpack_id=payment.soundpack_id,
                amount=payment.amount
            ).first()

            if not existing_sale:
                sale = Sale(
                    buyer_id=payment.user_id,
                    beat_id=payment.beat_id,
                    soundpack_id=payment.soundpack_id,
                    amount=payment.amount
                )
                if payment.discount_id:
                    sale.discount_id = payment.discount_id

                db.session.add(sale)
                db.session.flush()

                
                if payment.beat_id:
                    file_type = metadata.get("file_type")
                    template = ContractTemplate.query.filter_by(
                        beat_id=payment.beat_id, file_type=file_type
                    ).first()
                    if template:
                        contract_url = generate_contract_pdf(
                            template,
                            sale.buyer,
                            Beat.query.get(payment.beat_id),
                            file_type
                        )
                        contract = Contract(
                            buyer_id=payment.user_id,
                            beat_id=payment.beat_id,
                            file_type=file_type,
                            contract_type=template.contract_type,
                            terms=template.terms,
                            price=payment.amount,
                            contract_url=contract_url
                        )
                        db.session.add(contract)
                        # Link sale to contract
                        sale.contract = contract

            db.session.commit()
            return {"ok": True}, 200

        else:
            payment.status = "failed"
            db.session.commit()
            return {"ok": True}, 200


api.add_resource(PaystackWebhookResource, "/paystack/webhook")
