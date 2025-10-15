from flask_restful import Resource,Api
from flask import request
from server.utils.firebase_auth import firebase_auth_required
from server.schemas.user_schema import UserSchema
from . import auth_bp

api = Api(auth_bp)

user_schema = UserSchema()

class VerifyTokenResource(Resource):
    @firebase_auth_required
    def get(self):
        user = request.current_user
        return user_schema.dump(user), 200



api.add_resource(VerifyTokenResource, "/auth/verify-token")
