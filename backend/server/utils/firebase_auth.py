from functools import wraps
from flask import request, jsonify
from firebase_admin import auth
from server.models.user import User
from server.extension import db
import datetime


def create_session_cookie(id_token, expires_in=60 * 60 * 24 * 5): 
    try:
        return auth.create_session_cookie(id_token, expires_in=expires_in)
    except Exception as e:
        print("Error creating session cookie:", e)
        return None


def firebase_auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        
        if not auth_header or not auth_header.startswith("Bearer "):
            return {"error": "Missing or invalid authorization header"}, 401

        id_token = auth_header.split("Bearer ")[1]

        try:
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token["uid"]
            email = decoded_token.get("email")
            name = decoded_token.get("name", "Unnamed User")

            
            firebase_role = decoded_token.get("role", "buyer").lower()

          
            if firebase_role == "buyer":
                normalized_role = "artist"
            elif firebase_role == "admin":
                normalized_role = "producer"
            else:
                normalized_role = firebase_role  

           
            user = User.query.filter_by(email=email).first()
            if not user:
                user = User(
                    name=name,
                    email=email,
                    role=normalized_role
                )
                db.session.add(user)
                db.session.commit()
            else:
               
                if user.role != normalized_role:
                    user.role = normalized_role
                    db.session.commit()

          
            request.current_user = user

            print(f"Authenticated: {user.email} | Role: {user.role}")
            return f(*args, **kwargs)

        except Exception as e:
            print("Auth Error:", e)
            return {"error": "Invalid or expired token"}, 401

    return decorated_function
