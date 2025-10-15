from server.extension import ma
from marshmallow import fields
from server.models.user import User

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        include_fk = True

    created_at = fields.DateTime(dump_only=True)
