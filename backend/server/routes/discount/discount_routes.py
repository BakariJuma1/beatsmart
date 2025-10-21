from flask_restful import Resource, Api
from flask import request, jsonify
from server.models.discount import Discount
from server.models.beat import Beat
from server.models.soundpack import SoundPack
from server.extension import db
from server.utils.firebase_auth import firebase_auth_required
from server.utils.role import role_required, ROLES
from . import discount_bp
import datetime

api = Api(discount_bp)

class ActiveDiscountsResource(Resource):
    def get(self):
        """Get all active discounts for UI display"""
        from datetime import datetime
        now = datetime.utcnow()
        
        
        active_discounts = Discount.query.filter(
            Discount.is_active == True,
            (Discount.start_date.is_(None) | (Discount.start_date <= now)),
            (Discount.end_date.is_(None) | (Discount.end_date >= now)),
            (Discount.max_uses.is_(None) | (Discount.used_count < Discount.max_uses))
        ).all()
        
        discounts = []
        for discount in active_discounts:
            discount_data = {
                "id": discount.id,
                "code": discount.code,
                "percentage": discount.percentage,
                "name": discount.name,
                "description": discount.description,
                "applicable_to": discount.applicable_to,
                "item_id": discount.item_id,
                "valid_until": discount.end_date.isoformat() if discount.end_date else None,
                "max_uses": discount.max_uses,
                "used_count": discount.used_count
            }
            
           
            if discount.item_id:
                if discount.applicable_to == "beat":
                    beat = Beat.query.get(discount.item_id)
                    if beat:
                        discount_data["item_title"] = beat.title
                        discount_data["item_cover"] = beat.cover_url
                        discount_data["original_price"] = beat.price
                        discount_data["discounted_price"] = discount.apply_discount(beat.price)
                elif discount.applicable_to == "soundpack":
                    soundpack = SoundPack.query.get(discount.item_id)
                    if soundpack:
                        discount_data["item_title"] = soundpack.title
                        discount_data["item_cover"] = soundpack.cover_url
                        discount_data["original_price"] = soundpack.price
                        discount_data["discounted_price"] = discount.apply_discount(soundpack.price)
            else:
               
                discount_data["example_savings"] = f"Save {discount.percentage}% on any item"
            
            discounts.append(discount_data)
        
        return jsonify(discounts)

class ValidateDiscountResource(Resource):
    @firebase_auth_required
    def post(self):
        """Validate discount code for specific item"""
        user = request.current_user
        data = request.get_json()
        
        code = data.get('code')
        item_type = data.get('item_type')  
        item_id = data.get('item_id')
        
        if not code:
            return {"valid": False, "error": "Discount code is required"}, 400
        
        # Find active discount
        discount = Discount.query.filter_by(code=code, is_active=True).first()
        
        if not discount:
            return {"valid": False, "error": "Invalid discount code"}, 400
        
        if not discount.is_valid():
            return {"valid": False, "error": "Discount code has expired"}, 400
        
        # Check applicability
        if discount.applicable_to != "global" and discount.applicable_to != item_type:
            return {"valid": False, "error": f"Discount not applicable to {item_type}s"}, 400
        
        if discount.applicable_to != "global" and discount.item_id != item_id:
            return {"valid": False, "error": "Discount not applicable to this item"}, 400
        
       
        if item_type == "beat":
            item = Beat.query.get(item_id)
        elif item_type == "soundpack":
            item = SoundPack.query.get(item_id)
        else:
            return {"valid": False, "error": "Invalid item type"}, 400
        
        if not item:
            return {"valid": False, "error": "Item not found"}, 400
        
        original_price = float(item.price)
        final_price = discount.apply_discount(original_price)
        
        return {
            "valid": True,
            "discount": {
                "id": discount.id,
                "code": discount.code,
                "name": discount.name,
                "percentage": discount.percentage,
                "original_price": original_price,
                "final_price": final_price,
                "savings": original_price - final_price
            }
        }

class DiscountManagementResource(Resource):
    @firebase_auth_required
    @role_required(ROLES["ADMIN"])
    def post(self):
        """Create new discount (admin/producer only)"""
        data = request.get_json()
        
      
        if not data.get('code') or not data.get('percentage'):
            return {"error": "Code and percentage are required"}, 400
        
        # Check if code already exists
        existing = Discount.query.filter_by(code=data['code']).first()
        if existing:
            return {"error": "Discount code already exists"}, 400
        
        discount = Discount(
            code=data['code'],
            percentage=float(data['percentage']),
            name=data.get('name'),
            description=data.get('description'),
            applicable_to=data.get('applicable_to', 'global'),
            item_id=data.get('item_id'),
            max_uses=data.get('max_uses'),
            is_active=data.get('is_active', True)
        )
        
        # Set dates if provided
        if data.get('start_date'):
            discount.start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
        if data.get('end_date'):
            discount.end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
        
        db.session.add(discount)
        db.session.commit()
        
        return {
            "message": "Discount created successfully",
            "discount": {
                "id": discount.id,
                "code": discount.code,
                "percentage": discount.percentage,
                "applicable_to": discount.applicable_to
            }
        }, 201

api.add_resource(ActiveDiscountsResource, "/active")
api.add_resource(ValidateDiscountResource, "/validate")
api.add_resource(DiscountManagementResource, "/manage")