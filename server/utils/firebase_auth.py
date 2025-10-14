from functools import wraps
from flask import request, jsonify
from firebase_admin import auth
from server.models.user import User
from server.extension import db

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
                # Create  local profile automatically
                user = User(
                    name=name,
                    email=email,
                    role="buyer"  
                )
                db.session.add(user)
                db.session.commit()

            request.current_user = user
            return f(*args, **kwargs)

        except Exception as e:
            print(e)
            return jsonify({"error": "Invalid or expired token"}), 401

    return decorated_function
