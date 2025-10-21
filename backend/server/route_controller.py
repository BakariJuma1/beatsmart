from server.routes.auth import auth_bp
from server.routes.beats import beat_resource_bp
from server.routes.wishlist import wishlist_resource_bp
from server.routes.discount import discount_bp

def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(beat_resource_bp)
    app.register_blueprint(wishlist_resource_bp)
    app.register_blueprint(discount_bp,url_prefix='/api/discounts')
    