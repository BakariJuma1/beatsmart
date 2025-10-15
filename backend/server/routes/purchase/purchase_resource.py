import os
import requests
from flask_restful import Resource, Api
from flask import request, jsonify, current_app
from datetime import datetime
from server.models.payment import Payment
from server.models.beat import Beat
from server.models.soundpack import SoundPack
from server.models.discount import Discount
from server.extension import db
from server.utils.firebase_auth import firebase_auth_required
from server.utils.role import role_required, ROLES
from . import purchase_resource

api = Api(purchase_resource)

PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY")
PAYSTACK_BASE = "https://api.paystack.co"


def apply_discount_if_any(item_type, item_id, discount_code):
    discount = None
    final_price = None

    if discount_code:
        discount = Discount.query.filter_by(code=discount_code).first()
        if not discount or not discount.is_valid():
            return None, None

    if item_type == "beat":
        item = Beat.query.get(item_id)
    elif item_type == "soundpack":
        item = SoundPack.query.get(item_id)
    else:
        return None, None

    if not item:
        return None, None

    raw_price = float(item.price or 0.0)

    if discount:
     
        if discount.applicable_to and discount.applicable_to != item_type:
            return None, None
        if discount.item_id and discount.item_id != item_id:
            return None, None
        final_price = raw_price * (1 - discount.percentage / 100.0)
    else:
        final_price = raw_price

    return round(final_price, 2), discount


class PurchaseResource(Resource):
    @firebase_auth_required
    @role_required(ROLES["BUYER"]) 
    def post(self):
        user = request.current_user
        data = request.get_json() or {}

        item_type = data.get("item_type")
        item_id = data.get("item_id")
        file_type = data.get("file_type")
        discount_code = data.get("discount_code")
        callback_url = data.get("callback_url")

        if not item_type or not item_id:
            return {"error": "item_type and item_id required"}, 400

        final_price, discount_obj = apply_discount_if_any(item_type, item_id, discount_code)
        if final_price is None:
            return {"error": "Item not found or discount invalid/not applicable"}, 400

  
        payment = Payment(
            user_id=user.id,
            amount=final_price,
            currency="KES",
            method="paystack",
            status="pending",
            beat_id=item_id if item_type == "beat" else None,
            soundpack_id=item_id if item_type == "soundpack" else None
        )
        if discount_obj:
            payment.discount_id = discount_obj.id

        db.session.add(payment)
        db.session.commit()

       
        reference = f"{item_type.upper()}_{payment.id}_{int(datetime.utcnow().timestamp())}"
        payload = {
            "email": user.email,
            "amount": int(final_price * 100),
            "reference": reference,
            "callback_url": callback_url,
            "metadata": {
                "user_id": user.id,
                "item_type": item_type,
                "item_id": item_id,
                "file_type": file_type,
                "payment_id": payment.id,
                "discount_code": discount_code
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
            return {
                "payment_url": res_data["data"]["authorization_url"],
                "access_code": res_data["data"].get("access_code"),
                "reference": reference,
                "payment_id": payment.id
            }, 200

        current_app.logger.error("Paystack init failed: %s", res_data)
        return {"error": "Payment initialization failed", "detail": res_data}, 500


api.add_resource(PurchaseResource, "/purchase")
