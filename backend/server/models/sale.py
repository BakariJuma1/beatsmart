# app/models/sale.py
from datetime import datetime
from server.extension import db

class Sale(db.Model):
    __tablename__ = "sales"

    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    beat_id = db.Column(db.Integer, db.ForeignKey("beats.id"), nullable=True)
    soundpack_id = db.Column(db.Integer, db.ForeignKey("soundpacks.id"), nullable=True)
    contract_id = db.Column(db.Integer, db.ForeignKey("contracts.id"), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    buyer = db.relationship("User", back_populates="sales")
    file_type = db.Column(db.String(20), nullable=True) 
    beat = db.relationship("Beat", back_populates="sales", foreign_keys=[beat_id])
    soundpack = db.relationship("SoundPack", back_populates="sales", foreign_keys=[soundpack_id])
    contract = db.relationship("Contract", back_populates="sale", foreign_keys=[contract_id])

    def __repr__(self):
        return f"<Sale {self.id} - {self.amount}>"
