
from server.extension import ma
from marshmallow import fields
from server.models.contract import Contract

class ContractSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Contract
        load_instance = True
        include_fk = True

    created_at = fields.DateTime(dump_only=True)
    beat = fields.Nested("BeatSchema", only=("id","title","price"), dump_only=True)
    buyer = fields.Nested("UserSchema", only=("id","name","email"), dump_only=True)
