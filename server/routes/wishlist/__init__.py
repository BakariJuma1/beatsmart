from flask import Blueprint

wishlist_resource_bp = Blueprint('wishlist_resource_bp',__name__)


from .wishlist_resource import *
