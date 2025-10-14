from server.extension import ma
from marshmallow import fields, validate, post_load
from server.models.user import User

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        include_fk = True
        exclude = ("password_hash",)

    password = fields.String(load_only=True, required=True, validate=validate.Length(min=6))
    created_at = fields.DateTime(dump_only=True)

    @post_load
    def make_user(self, data, **kwargs):
        """Automatically hash password on load"""
        if "password" in data:
            pw = data.pop("password")
            user = User(**data)
            user.set_password(pw)
            return user
        return User(**data)
