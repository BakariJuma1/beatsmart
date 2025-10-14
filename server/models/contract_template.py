
from datetime import datetime
from server.extension import db

class ContractTemplate(db.Model):
    __tablename__ = "contract_templates"

    id = db.Column(db.Integer, primary_key=True)
    beat_id = db.Column(db.Integer, db.ForeignKey("beats.id"), nullable=False)
    file_type = db.Column(db.String(20), nullable=False) 
    contract_type = db.Column(db.String(50), nullable=False)
    terms = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, default=0.0)
    contract_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    beat = db.relationship("Beat", back_populates="contract_templates")
    contracts = db.relationship("Contract", back_populates="template")
