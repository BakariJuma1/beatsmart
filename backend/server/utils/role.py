from functools import wraps
from flask import request

ROLES = {
    "ADMIN": "producer",
    "BUYER": "artist"
}

def role_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = getattr(request, "current_user", None)
            
            if not user:
                return {"error": "User not authenticated"}, 401

            if user.role not in roles:
                return {
                    "error": "Access denied",
                    "your_role": user.role,
                    "allowed_roles": roles
                }, 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator
