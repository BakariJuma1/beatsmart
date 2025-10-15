from flask import Blueprint

beat_resource_bp = Blueprint('beat_resource_bp',__name__)


from .beat_resource import *
from .beats_file_resource import *