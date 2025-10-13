# app/models/discount.py
from datetime import datetime
from server.extension import db

class Discount(db.Model):
    __tablename__ = "discounts"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(40), unique=True, nullable=True)  
    percentage = db.Column(db.Float, nullable=False, default=0.0) 
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    applicable_to = db.Column(db.String(50), nullable=True) 
    item_id = db.Column(db.Integer, nullable=True)            
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def is_valid(self):
        from datetime import datetime
        now = datetime.utcnow()
        if not self.is_active:
            return False
        if self.start_date and now < self.start_date:
            return False
        if self.end_date and now > self.end_date:
            return False
        return True

    def __repr__(self):
        return f"<Discount {self.code or 'global'} {self.percentage}%>"
