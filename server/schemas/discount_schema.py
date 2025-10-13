
from server.extension import ma
from marshmallow import fields
from server.models.discount import Discount

class DiscountSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Discount
        load_instance = True
        include_fk = True

    created_at = fields.DateTime(dump_only=True)
