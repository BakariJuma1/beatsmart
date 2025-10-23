
from flask_restful import Resource, Api
from flask import request, jsonify
from server.models.sale import Sale
from server.models.beat import Beat
from server.models.soundpack import SoundPack
from server.extension import db
from server.utils.firebase_auth import firebase_auth_required
from . import purchase_bp

api = Api(purchase_bp)

class PurchaseHistoryResource(Resource):
    @firebase_auth_required
    def get(self):
        """Get user's purchase history"""
        user = request.current_user
        
       
        purchases = Sale.query.filter_by(buyer_id=user.id).order_by(Sale.created_at.desc()).all()
        
        purchase_history = []
        for purchase in purchases:
            purchase_data = {
                "id": purchase.id,
                "item_type": "beat" if purchase.beat_id else "soundpack",
                "item_id": purchase.beat_id or purchase.soundpack_id,
                "amount": float(purchase.amount),
                "file_type": purchase.file_type,
                "purchased_at": purchase.created_at.isoformat() if purchase.created_at else None,
                "download_url": f"/api/beats/{purchase.beat_id}/files/{purchase.file_type}" if purchase.beat_id else f"/api/soundpacks/{purchase.soundpack_id}/download"
            }
           
            if purchase.beat_id:
                beat = Beat.query.get(purchase.beat_id)
                if beat:
                    purchase_data["item_title"] = beat.title
                    purchase_data["item_cover"] = beat.cover_url
                    purchase_data["producer_name"] = beat.producer.name if beat.producer else "Baraju"
            elif purchase.soundpack_id:
                soundpack = SoundPack.query.get(purchase.soundpack_id)
                if soundpack:
                    purchase_data["item_title"] = soundpack.title
                    purchase_data["item_cover"] = soundpack.cover_url
                    purchase_data["producer_name"] = soundpack.producer.name if soundpack.producer else "Baraju"
            
            purchase_history.append(purchase_data)
        
        return purchase_history,200

api.add_resource(PurchaseHistoryResource, "/history")