from datetime import datetime
from server.extension import db

class SoundPack(db.Model):
    __tablename__ = "soundpacks"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(180), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False, default=0.0)
    cover_url = db.Column(db.String(255), nullable=True)
    file_url = db.Column(db.String(255), nullable=True)
    producer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    producer = db.relationship("User", back_populates="soundpacks")
    wishlists = db.relationship("Wishlist", primaryjoin="and_(Wishlist.item_type=='soundpack', foreign(Wishlist.item_id)==SoundPack.id)", viewonly=True)
    sales = db.relationship("Sale", back_populates="soundpack", lazy="dynamic")
   
    payments = db.relationship("Payment", back_populates="soundpack", lazy="dynamic")

    def __repr__(self):
        return f"<SoundPack {self.name}>"
