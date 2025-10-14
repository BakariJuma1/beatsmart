from flask import Blueprint

auth_bp = Blueprint('auth_bp',__name__)


from .login import *
from .signup import *
from .forgot_password import *
from .verify import *
