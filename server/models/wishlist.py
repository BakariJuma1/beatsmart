# app/models/wishlist.py
from datetime import datetime
from server.extension import db

class Wishlist(db.Model):
    __tablename__ = "wishlists"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    item_type = db.Column(db.String(50), nullable=False)  
    item_id = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="wishlists")

    def __repr__(self):
        return f"<Wishlist user={self.user_id} {self.item_type}:{self.item_id}>"
