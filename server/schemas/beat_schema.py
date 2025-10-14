from server.extension import ma
from marshmallow import fields, validate, validates, ValidationError
from server.models.beat import Beat
from server.models.user import User  

class BeatSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Beat
        load_instance = True
        include_fk = True


    files = fields.Nested("BeatFileSchema", many=True)
    producer = fields.Nested("UserSchema", only=("id","name","email"), dump_only=True)
    created_at = fields.DateTime(dump_only=True)

   
    title = fields.String(required=True, validate=validate.Length(min=1, max=180))
    description = fields.String(validate=validate.Length(max=1000))
    genre = fields.String(validate=validate.Length(max=80))
    bpm = fields.Integer(validate=validate.Range(min=20, max=300))  
    key = fields.String(validate=validate.Length(max=20))
    price = fields.Float(required=True, validate=validate.Range(min=0.0))
    cover_url = fields.Url(required=False)
    file_url = fields.Url(required=False)
    preview_url = fields.Url(required=False)
    exclusive_available = fields.Boolean()
    is_sold_exclusive = fields.Boolean()
    producer_id = fields.Integer(required=True)

    @validates("producer_id")
    def validate_producer(self, value):
        if not User.query.get(value):
            raise ValidationError("Producer with given ID does not exist")
