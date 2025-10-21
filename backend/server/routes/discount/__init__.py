from flask import Blueprint

discount_bp = Blueprint('discount_bp',__name__)


from .discount_routes import *
