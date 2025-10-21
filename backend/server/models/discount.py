from datetime import datetime
from server.extension import db

class Discount(db.Model):
    __tablename__ = "discounts"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(40), unique=True, nullable=False)  
    percentage = db.Column(db.Float, nullable=False, default=0.0) 
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    applicable_to = db.Column(db.String(50), nullable=False, default="global")  
    item_id = db.Column(db.Integer, nullable=True)  
    name = db.Column(db.String(100), nullable=True)  
    description = db.Column(db.Text, nullable=True) 
    max_uses = db.Column(db.Integer, nullable=True) 
    used_count = db.Column(db.Integer, default=0) 
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
        if self.max_uses and self.used_count >= self.max_uses:
            return False
        return True

    def apply_discount(self, original_price):
        """Calculate discounted price"""
        return round(original_price * (1 - self.percentage / 100.0), 2)

    def __repr__(self):
        return f"<Discount {self.code} {self.percentage}% ({self.applicable_to})>"