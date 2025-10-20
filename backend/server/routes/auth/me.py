from flask_restful import Resource, Api
from flask import request, jsonify
from firebase_admin import auth
from server.models.user import User
from server.schemas.user_schema import UserSchema
from server.extension import db
from server.utils.role import ROLES  
from . import auth_bp

api = Api(auth_bp)
user_schema = UserSchema()


class MeResource(Resource):
    def get(self):
        
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return {"error": "Missing or invalid Authorization header"}, 401

        id_token = auth_header.split("Bearer ")[1]

        try:
           
            decoded_token = auth.verify_id_token(id_token)
            email = decoded_token.get("email")
            name = decoded_token.get("name", "Unnamed User")

            if not email:
                return {"error": "Invalid token: missing email"}, 400

          
            user = User.query.filter_by(email=email).first()
            if not user:
             
                user = User(name=name, email=email, role=ROLES["BUYER"])
                db.session.add(user)
                db.session.commit()

           
            role_display = ROLES.get(user.role.upper(), user.role)

          
            user_data = user_schema.dump(user)
            user_data["role_display"] = role_display  

            return user_data, 200

        except Exception as e:
            print("Auth Error:", e)
            return {"error": "Invalid or expired token"}, 401


api.add_resource(MeResource, "/auth/me")
