import os
import requests
from flask_restful import Resource, Api
from flask import request, jsonify, current_app
from datetime import datetime
from server.models.payment import Payment
from server.models.beat import Beat
from server.models.beat_file import BeatFile
from server.models.soundpack import SoundPack
from server.models.discount import Discount
from server.extension import db
from server.utils.firebase_auth import firebase_auth_required
from server.utils.role import role_required, ROLES
from . import purchase_bp

api = Api(purchase_bp)

PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY")
PAYSTACK_BASE = "https://api.paystack.co"
CURRENCY_API = "https://api.exchangerate.host/convert"


def apply_discount_if_any(item_type, item_id, discount_code, base_price):
    """Applies discount if valid"""
    discount = None
    if discount_code:
        discount = Discount.query.filter_by(code=discount_code).first()
        if not discount or not discount.is_valid():
            return None, None

        if discount.applicable_to != "global" and discount.applicable_to != item_type:
            return None, None
        if discount.applicable_to != "global" and discount.item_id != item_id:
            return None, None

    if discount:
        final_price = base_price * (1 - discount.percentage / 100.0)
    else:
        final_price = base_price

    return round(final_price, 2), discount


def convert_usd_to_kes(amount_usd):
    """Fetch live USD→KES conversion rate and return KES amount"""
    try:
        response = requests.get(f"{CURRENCY_API}?from=USD&to=KES&amount={amount_usd}", timeout=10)
        data = response.json()
        if data.get("success"):
            return round(data["result"], 2)
        else:
            current_app.logger.warning("Currency API failed, using fallback rate 130")
            return round(amount_usd * 130, 2) 
    except Exception as e:
        current_app.logger.error(f"Currency conversion error: {e}")
        return round(amount_usd * 130, 2)


class PurchaseResource(Resource):
    @firebase_auth_required
    @role_required("artist", "producer")
    def post(self):
        user = request.current_user
        data = request.get_json() or {}

        item_type = data.get("item_type")
        item_id = data.get("item_id")
        file_type = data.get("file_type")
        discount_code = data.get("discount_code")
        callback_url = data.get("callback_url")

        if not item_type or not item_id or not file_type:
            return {"error": "item_type, item_id, and file_type are required"}, 400

        
        if item_type == "beat":
            beat = Beat.query.get(item_id)
            if not beat:
                return {"error": "Beat not found"}, 404

            beat_file = BeatFile.query.filter_by(beat_id=item_id, file_type=file_type).first()
            if not beat_file:
                return {"error": f"File type '{file_type}' not available for this beat"}, 400

            if file_type == "exclusive" and beat.is_sold_exclusive:
                return {"error": "Exclusive rights already sold for this beat"}, 400

            base_price = beat_file.price
            item = beat

        elif item_type == "soundpack":
            item = SoundPack.query.get(item_id)
            if not item:
                return {"error": "Soundpack not found"}, 404
            base_price = float(item.price or 0.0)
        else:
            return {"error": "Invalid item type"}, 400

       
        final_price_usd, discount_obj = apply_discount_if_any(item_type, item_id, discount_code, base_price)
        if final_price_usd is None:
            return {"error": "Discount invalid/not applicable"}, 400

        final_price_kes = convert_usd_to_kes(final_price_usd)

        
        payment = Payment(
            user_id=user.id,
            amount=final_price_usd,
            currency="USD",
            method="paystack",
            status="pending",
            beat_id=item_id if item_type == "beat" else None,
            soundpack_id=item_id if item_type == "soundpack" else None
        )
        if discount_obj:
            payment.discount_id = discount_obj.id

        db.session.add(payment)
        db.session.commit()

        reference = f"{item_type.upper()}_{file_type.upper()}_{payment.id}_{int(datetime.utcnow().timestamp())}"

        payload = {
            "email": user.email,
            "amount": int(final_price_kes * 100),  # paystack expects amount in Kobo/Cents
            "currency": "KES",
            "reference": reference,
            "callback_url": callback_url,
            "metadata": {
                "user_id": user.id,
                "item_type": item_type,
                "item_id": item_id,
                "file_type": file_type,
                "payment_id": payment.id,
                "price_usd": final_price_usd,
                "price_kes": final_price_kes,
            }
        }

        headers = {"Authorization": f"Bearer {PAYSTACK_SECRET_KEY}"}

        try:
            res = requests.post(f"{PAYSTACK_BASE}/transaction/initialize", json=payload, headers=headers, timeout=15)
            res_data = res.json()
        except Exception as e:
            current_app.logger.error("Paystack initialize error: %s", e)
            return {"error": "Payment initialization failed"}, 500

        if res_data.get("status") and res_data.get("data"):
            payment.transaction_ref = reference
            db.session.commit()

            current_app.logger.info(
                f"Purchase initiated: {file_type} for {item_type} {item_id} at ${final_price_usd} USD ({final_price_kes} KES)"
            )

            return {
                "payment_url": res_data["data"]["authorization_url"],
                "access_code": res_data["data"].get("access_code"),
                "reference": reference,
                "payment_id": payment.id,
                "file_type": file_type,
                "amount_usd": final_price_usd,
                "amount_kes": final_price_kes,
                "currency": "KES"
            }, 200

        current_app.logger.error("Paystack init failed: %s", res_data)
        return {"error": "Payment initialization failed", "detail": res_data}, 500


api.add_resource(PurchaseResource, "")
