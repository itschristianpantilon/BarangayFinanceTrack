from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.extensions import jwt   #
from dotenv import load_dotenv 

def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)

    # Initialize extensions
    jwt.init_app(app)
    # Register blueprints
    #TEST
    from app.routes.db_test_routes import db_test_bp
    from app.routes.tests_routes import test_bp
    from app.routes.auth_routes import auth_bp
    #GENERAL 
    from app.routes.general_routes import general_bp
    #ADMIN
    from app.routes.admin_routes import admin_bp
    #ENCODERS
    from app.routes.encoder_routes import encoder_bp
    #CHECKER
    from app.routes.checker_routes import checker_bp
    #APPROVER
    from app.routes.approver_routes import approver_bp
    #====================================================================================
    #TEST
    app.register_blueprint(db_test_bp, url_prefix="/api")
    app.register_blueprint(test_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api")
    #GENERAL
    app.register_blueprint(general_bp, url_prefix="/api")
    #ADMIN
    app.register_blueprint(admin_bp, url_prefix="/api")
    #ENCODERS  
    app.register_blueprint(encoder_bp, url_prefix="/api")
    #CHECKER
    app.register_blueprint(checker_bp, url_prefix="/api")
    #APPROVER
    app.register_blueprint(approver_bp, url_prefix="/api")

    return app