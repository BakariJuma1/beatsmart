from flask_restful import Resource, Api
from flask import request, jsonify
from server.models.wishlist import Wishlist
from server.models.beat import Beat
from server.models.soundpack import SoundPack
from server.schemas.wishlist_schema import WishlistSchema
from server.extension import db
from server.utils.firebase_auth import firebase_auth_required
from . import wishlist_resource_bp

api = Api(wishlist_resource_bp)
wishlist_schema = WishlistSchema()
wishlists_schema = WishlistSchema(many=True)

class WishlistResource(Resource):
    @firebase_auth_required
    def get(self):
        try:
            user = request.current_user
            wishlists = Wishlist.query.filter_by(user_id=user.id).order_by(Wishlist.created_at.desc()).all()
            return {"data": wishlists_schema.dump(wishlists)}, 200
        except Exception as e:
            return {"error": str(e)}, 500

    @firebase_auth_required
    def post(self):
        try:
            user = request.current_user
            data = request.get_json()
            
            if not data:
                return {"error": "Invalid JSON data"}, 400

            item_type = data.get("item_type")
            item_id = data.get("item_id")

            if not item_type or not item_id:
                return {"error": "Missing item_type or item_id"}, 400

            if item_type not in ["beat", "soundpack"]:
                return {"error": "Invalid item type. Must be 'beat' or 'soundpack'"}, 400

            # Check if item exists
            if item_type == "beat":
                item = Beat.query.get(item_id)
            else:
                item = SoundPack.query.get(item_id)
                
            if not item:
                return {"error": f"{item_type} not found"}, 404

            # Check if already in wishlist
            existing = Wishlist.query.filter_by(
                user_id=user.id, 
                item_type=item_type, 
                item_id=item_id
            ).first()
            
            if existing:
                return {"message": "Item already in wishlist", "data": wishlist_schema.dump(existing)}, 200

            # Add to wishlist
            wishlist_item = Wishlist(
                user_id=user.id, 
                item_type=item_type, 
                item_id=item_id
            )
            db.session.add(wishlist_item)
            db.session.commit()

            return {"message": "Item added to wishlist", "data": wishlist_schema.dump(wishlist_item)}, 201
            
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

    @firebase_auth_required
    def delete(self, wishlist_id):
        try:
            user = request.current_user
            wishlist_item = Wishlist.query.get(wishlist_id)
            
            if not wishlist_item:
                return {"error": "Wishlist item not found"}, 404

            if wishlist_item.user_id != user.id:
                return {"error": "Unauthorized"}, 403

            db.session.delete(wishlist_item)
            db.session.commit()
            
            return {"message": "Item removed from wishlist"}, 200
            
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

api.add_resource(WishlistResource, "/wishlist", "/wishlist/<int:wishlist_id>")