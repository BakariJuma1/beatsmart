from flask import Flask
from flask_cors import CORS
from flask_restful import Api
from dotenv import load_dotenv
from server.extension import db, migrate, jwt,ma
from server.route_controller import register_routes
from server.firebase_init import auth
import os
from datetime import timedelta
import logging
from server.seed import seed



load_dotenv()

def create_app():
    app = Flask(__name__)
    
  
    CORS(app,
         supports_credentials=True,
         origins=[
             "http://localhost:5173",
             "http://127.0.0.1:5173",
             
         ],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"],
         expose_headers=["Authorization"],
         max_age=3600
    )
     
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-secret-key")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_HEADER_NAME"] = "Authorization"
    app.config["JWT_HEADER_TYPE"] = "Bearer"
   
    app.config.from_prefixed_env()
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        "pool_pre_ping": True
    }
    
   
    db.init_app(app)
    migrate.init_app(app, db)
    api = Api(app)
    jwt.init_app(app)
    ma.init_app(app)
    

    with app.app_context():
        from flask_migrate import upgrade
        upgrade()
        seed()


   
    register_routes(app)

    
 
    @app.errorhandler(Exception)
    def handle_error(e):
        app.logger.error(f"Unhandled error: {e}", exc_info=True)
        return {"error": str(e)}, 500

    
    @app.route('/')
    def home():
        return {"message": "Welcome to beatsmart API"}
    
    @app.route('/favicon.ico')
    def favicon():
        return '', 204  

    
    return app
