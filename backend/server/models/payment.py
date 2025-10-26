from datetime import datetime
from server.extension import db

class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), default="KES")
    method = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(30), default="pending")
    transaction_ref = db.Column(db.String(200), nullable=True, unique=True)

   
    verified = db.Column(db.Boolean, default=False)  
    gateway_response = db.Column(db.String(255), nullable=True)  
    paid_at = db.Column(db.DateTime, nullable=True)  
    paystack_ref = db.Column(db.String(100), nullable=True, unique=True) 

  
    payment_metadata = db.Column(db.JSON, nullable=True)

    beat_id = db.Column(db.Integer, db.ForeignKey("beats.id"), nullable=True)
    soundpack_id = db.Column(db.Integer, db.ForeignKey("soundpacks.id"), nullable=True)
    contract_id = db.Column(db.Integer, db.ForeignKey("contracts.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship("User", back_populates="payments")
    beat = db.relationship("Beat", back_populates="payments", foreign_keys=[beat_id])
    contract = db.relationship("Contract", back_populates="payments", foreign_keys=[contract_id])
    soundpack = db.relationship("SoundPack", back_populates="payments", foreign_keys=[soundpack_id])

    def __repr__(self):
        return f"<Payment {self.transaction_ref or self.paystack_ref} - {self.amount}{self.currency}>"
