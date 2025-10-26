from functools import wraps
from flask import request, jsonify


ROLES = {
    "ADMIN": "producer",
    "BUYER": "artist"
}

def role_required(*roles):
    """
    Restrict access to endpoints based on user roles.
    Example:
        @role_required("artist", "producer")
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = getattr(request, "current_user", None)

            if not user:
                return jsonify({"error": "User not authenticated"}), 401

            print(" USER ROLE DEBUG:", getattr(user, "role", None))
            print(" ALLOWED ROLES:", roles)

            if user.role not in roles:
                return {
                    "error": "Access denied",
                    "your_role": user.role,
                    "allowed_roles": roles
                }, 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator
