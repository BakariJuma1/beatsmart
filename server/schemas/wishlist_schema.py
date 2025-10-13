
from server.extension import ma
from marshmallow import fields
from server.models.wishlist import Wishlist

class WishlistSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Wishlist
        load_instance = True
        include_fk = True

    created_at = fields.DateTime(dump_only=True)
