
from server.extension import ma
from marshmallow import fields
from server.models.soundpack import SoundPack

class SoundPackSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = SoundPack
        load_instance = True
        include_fk = True

    created_at = fields.DateTime(dump_only=True)
    producer = fields.Nested("UserSchema", only=("id","name","email"), dump_only=True)
