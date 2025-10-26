from functools import wraps
from flask import request, jsonify
import firebase_admin
from firebase_admin import auth
from types import SimpleNamespace

def firebase_auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization header missing"}), 401

        token = auth_header.split("Bearer ")[1]
        try:
            decoded_token = auth.verify_id_token(token)
            user_role = decoded_token.get("role", "buyer")

            
            user_role = str(user_role).lower()

            if user_role == "buyer":
                user_role = "artist"
            elif user_role == "admin":
                user_role = "producer"

            request.current_user = SimpleNamespace(
                id=decoded_token.get("uid"),
                email=decoded_token.get("email"),
                role=user_role
            )

            print(" Normalized user role:", user_role)

        except Exception as e:
            print("Auth Error:", e)
            return jsonify({"error": "Invalid or expired token"}), 401

        return f(*args, **kwargs)

    return decorated_function
