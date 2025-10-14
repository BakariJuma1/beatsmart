from flask import request
from flask_restful import Resource,Api
from datetime import timedelta
from server.extension import db
from server.models.user import User
from server.schemas.user_schema import UserSchema
from . import auth_bp

api = Api(auth_bp)

user_schema = UserSchema()

class SignupResource(Resource):
    def post(self):
        json_data = request.get_json()
        if not json_data:
            return {"error": "No input data provided"}, 400

        try:
            user = user_schema.load(json_data)
        except Exception as e:
            return {"error": str(e)}, 400

      
        if User.query.filter_by(email=user.email).first():
            return {"error": "Email already registered"}, 400

        db.session.add(user)
        db.session.commit()

        return {"message": "Account created successfully! Please verify your email."}, 201

api.add_resource(SignupResource, "/auth/signup")