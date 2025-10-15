from functools import wraps
from flask import request, jsonify, make_response
from firebase_admin import auth
from server.models.user import User
from server.extension import db
import datetime


def create_session_cookie(id_token, expires_in=60 * 60 * 24 * 5): 
    try:
        session_cookie = auth.create_session_cookie(id_token, expires_in=expires_in)
        return session_cookie
    except Exception as e:
        print("Error creating session cookie:", e)
        return None


def firebase_auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid authorization header"}), 401

        id_token = auth_header.split("Bearer ")[1]

        try:
         
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token["uid"]
            email = decoded_token.get("email")
            name = decoded_token.get("name", "Unnamed User")

         
            user = User.query.filter_by(email=email).first()
            if not user:
                user = User(
                    name=name,
                    email=email,
                    role="buyer"  
                )
                db.session.add(user)
                db.session.commit()

            
            session_cookie = create_session_cookie(id_token)
            if not session_cookie:
                return jsonify({"error": "Failed to create session cookie"}), 500

            response = make_response(f(*args, **kwargs))

           
            expires = datetime.datetime.utcnow() + datetime.timedelta(days=5)
            response.set_cookie(
                "session",
                session_cookie,
                expires=expires,
                httponly=True,
                secure=True,       
                samesite="Lax"
            )

         
            request.current_user = user

            return response

        except Exception as e:
            print("Auth Error:", e)
            return jsonify({"error": "Invalid or expired token"}), 401

    return decorated_function
