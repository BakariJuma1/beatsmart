from flask import Blueprint

purchase_resource_bp = Blueprint('purchase_resource_bp',__name__)


from .paystack_webhook import *
from .purchase_resource import *