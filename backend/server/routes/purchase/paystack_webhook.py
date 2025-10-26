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
from . import purchase_bp

api = Api(purchase_bp)

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

        # Find related payment
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
            current_app.logger.warning(f"Payment not found for reference {ref}")
            return {"ok": True}, 200

        # Avoid double processing
        if payment.status == "success":
            current_app.logger.info(f"Payment {ref} already processed")
            return {"ok": True}, 200

        # ✅ Extract Paystack amount info
        paystack_amount_kobo = data.get("amount", 0)
        paystack_currency = data.get("currency", "KES").upper()
        paystack_amount = paystack_amount_kobo / 100.0  # convert from kobo-like units

        # Log for debugging
        current_app.logger.info(
            f"Webhook received: Ref={ref}, Paystack Amount={paystack_amount} {paystack_currency}, "
            f"Local USD Display={payment.amount} USD"
        )

        if status in ("success", "successful"):
            try:
                # ✅ Mark payment success and store actual paid currency
                payment.status = "success"
                payment.paid_amount = paystack_amount
                payment.paid_currency = paystack_currency

                db.session.add(payment)

                file_type = metadata.get("file_type")
                current_app.logger.info(f"Processing purchase for file_type: {file_type}")

                # Avoid duplicate sales
                existing_sale = Sale.query.filter_by(
                    buyer_id=payment.user_id,
                    beat_id=payment.beat_id,
                    file_type=file_type
                ).first()

                if not existing_sale:
                    sale = Sale(
                        buyer_id=payment.user_id,
                        beat_id=payment.beat_id,
                        soundpack_id=payment.soundpack_id,
                        amount=payment.amount,  # keep your USD display amount
                        discount_id=payment.discount_id,
                        file_type=file_type
                    )
                    db.session.add(sale)
                    db.session.flush()

                    # Link contract if applicable
                    if payment.beat_id:
                        beat = Beat.query.get(payment.beat_id)
                        if beat:
                            sale.producer_id = beat.producer_id

                            template = ContractTemplate.query.filter_by(
                                beat_id=payment.beat_id,
                                file_type=file_type
                            ).first()

                            if template:
                                contract_url = generate_contract_pdf(
                                    template,
                                    sale.buyer,
                                    beat,
                                    file_type
                                )

                                contract = Contract(
                                    buyer_id=payment.user_id,
                                    beat_id=payment.beat_id,
                                    file_type=file_type,
                                    contract_type=template.contract_type,
                                    terms=template.terms,
                                    price=payment.amount,  # again, USD value
                                    contract_url=contract_url
                                )

                                db.session.add(contract)
                                sale.contract = contract

                db.session.commit()
                current_app.logger.info(
                    f"Payment {ref} processed successfully — USD: {payment.amount}, "
                    f"Paid: {paystack_amount} {paystack_currency}"
                )
                return {"ok": True}, 200

            except Exception as e:
                db.session.rollback()
                current_app.logger.error(f"Error processing webhook: {e}")
                return {"error": "Server error"}, 500

        else:
            payment.status = "failed"
            db.session.commit()
            current_app.logger.info(f"Payment {ref} failed")
            return {"ok": True}, 200


api.add_resource(PaystackWebhookResource, "/paystack/webhook")
