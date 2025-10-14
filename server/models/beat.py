
from datetime import datetime
from server.extension import db

class Beat(db.Model):
    __tablename__ = "beats"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(180), nullable=False)
    description = db.Column(db.Text, nullable=True)
    genre = db.Column(db.String(80), nullable=True)
    bpm = db.Column(db.Integer, nullable=True)
    key = db.Column(db.String(20), nullable=True)
    price = db.Column(db.Float, nullable=False, default=0.0)  
    cover_url = db.Column(db.String(255), nullable=True)
    file_url = db.Column(db.String(255), nullable=True)       
    preview_url = db.Column(db.String(255), nullable=True)   
    exclusive_available = db.Column(db.Boolean, default=True)
    is_sold_exclusive = db.Column(db.Boolean, default=False) 
    producer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # relationships
    producer = db.relationship("User", back_populates="beats")
    contracts = db.relationship("Contract", back_populates="beat", lazy="dynamic")
    wishlists = db.relationship("Wishlist", primaryjoin="and_(Wishlist.item_type=='beat', foreign(Wishlist.item_id)==Beat.id)", viewonly=True)
    sales = db.relationship("Sale", back_populates="beat", lazy="dynamic")
    payments = db.relationship("Payment", back_populates="beat", lazy="dynamic")
    files = db.relationship("BeatFile", back_populates="beat", cascade="all, delete-orphan")
    contract_templates = db.relationship("ContractTemplate", back_populates="beat")


    def __repr__(self):
        return f"<Beat {self.title}>"
