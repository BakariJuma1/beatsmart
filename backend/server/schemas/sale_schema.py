# app/schemas/sale_schema.py
from server.extension import ma
from marshmallow import fields
from server.models.sale import Sale

class SaleSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Sale
        load_instance = True
        include_fk = True

    created_at = fields.DateTime(dump_only=True)

    #  buyer info
    buyer = fields.Nested(
        "UserSchema",
        only=("id", "name", "email"),
        dump_only=True
    )

    beat = fields.Nested(
        "BeatSchema",
        only=("id", "title", "price"),
        dump_only=True
    )

    soundpack = fields.Nested(
        "SoundPackSchema",
        only=("id", "name", "price"),
        dump_only=True
    )

    # Contract summary if present
    contract = fields.Nested(
        "ContractSchema",
        only=("id", "contract_type", "price", "status"),
        dump_only=True
    )
