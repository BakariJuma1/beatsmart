from server.extension import ma
from marshmallow import fields
from server.models.beat import Beat

class BeatSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Beat
        load_instance = True
        include_fk = True

    files = fields.Nested("BeatFileSchema", many=True)
    created_at = fields.DateTime(dump_only=True)
    producer = fields.Nested("UserSchema", only=("id","name","email"), dump_only=True)
