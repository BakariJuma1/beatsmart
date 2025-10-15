from datetime import datetime
from server.extension import db

class Contract(db.Model):
    __tablename__ = "contracts"

    id = db.Column(db.Integer, primary_key=True)
    contract_type = db.Column(db.String(50), nullable=False)  
    terms = db.Column(db.Text, nullable=True)                 
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime, nullable=True)
    price = db.Column(db.Float, nullable=False, default=0.0)
    status = db.Column(db.String(30), default="active")      
    beat_id = db.Column(db.Integer, db.ForeignKey("beats.id"), nullable=False)
    buyer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    contract_url = db.Column(db.String(255), nullable=True) 

  
    beat = db.relationship("Beat", back_populates="contracts")
    buyer = db.relationship("User", back_populates="contracts")
    sale = db.relationship("Sale", back_populates="contract", uselist=False)
    payments = db.relationship("Payment", back_populates="contract", lazy="dynamic")
    contract_template_id = db.Column(db.Integer, db.ForeignKey("contract_templates.id"))
    template = db.relationship("ContractTemplate", back_populates="contracts")


    def __repr__(self):
        return f"<Contract {self.contract_type} - Beat {self.beat_id} -> Buyer {self.buyer_id}>"
