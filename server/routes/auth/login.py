from flask import request
from flask_restful import Resource,Api
from flask_jwt_extended import create_access_token
from datetime import timedelta
from server.models.user import User
from server.schemas.user_schema import UserSchema
from . import auth_bp

api = Api(auth_bp)

user_schema = UserSchema()


class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        if not data or not data.get("email") or not data.get("password"):
            return {"error": "Email and password required"}, 400

        user = User.query.filter_by(email=data["email"]).first()
        if not user or not user.check_password(data["password"]):
            return {"error": "Invalid credentials"}, 401

        token = create_access_token(identity=user.id, expires_delta=timedelta(hours=12))

        return {
            "message": "Login successful",
            "access_token": token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        }, 200



api.add_resource(LoginResource, "/auth/login")