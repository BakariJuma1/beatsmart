from datetime import datetime
from server.extension import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default="buyer")  
    bio = db.Column(db.Text, nullable=True)
    profile_image = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # relationships
    beats = db.relationship("Beat", back_populates="producer", lazy="dynamic")
    soundpacks = db.relationship("SoundPack", back_populates="producer", lazy="dynamic")
    sales = db.relationship("Sale", back_populates="buyer", lazy="dynamic")
    payments = db.relationship("Payment", back_populates="user", lazy="dynamic")
    wishlists = db.relationship("Wishlist", back_populates="user", lazy="dynamic")
    contracts = db.relationship("Contract", back_populates="buyer", lazy="dynamic")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def is_producer(self):
        return self.role == "producer"

    def __repr__(self):
        return f"<User {self.email}>"
