from flask import request, jsonify, make_response
from flask_restful import Resource, Api
from firebase_admin import auth
from server.utils.firebase_auth import create_session_cookie
from server.models.user import User
from server.extension import db
from . import auth_bp

api = Api(auth_bp)

class SessionResource(Resource):
    def post(self):
        data = request.get_json()
        id_token = data.get("idToken")

        if not id_token:
            return {"error": "Missing ID token"}, 400

        try:
            decoded_token = auth.verify_id_token(id_token)
            email = decoded_token.get("email")
            name = decoded_token.get("name", "Unnamed User")

           
            user = User.query.filter_by(email=email).first()
            if not user:
                user = User(name=name, email=email, role="buyer")
                db.session.add(user)
                db.session.commit()

            session_cookie = create_session_cookie(id_token)
            if not session_cookie:
                return {"error": "Failed to create session cookie"}, 500

            resp = make_response({"message": "Session created"})
            resp.set_cookie(
                "session",
                session_cookie,
                max_age=60 * 60 * 24 * 5,
                httponly=True,
                secure=True,      
                samesite="Lax"
            )
            return resp, 200

        except Exception as e:
            print(e)
            return {"error": "Invalid ID token"}, 401

api.add_resource(SessionResource, "/auth/session")
