
from server.extension import ma
from marshmallow import fields
from server.models.payment import Payment

class PaymentSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Payment
        load_instance = True
        include_fk = True

    created_at = fields.DateTime(dump_only=True)
