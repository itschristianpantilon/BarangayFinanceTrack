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
    app.register_blueprint(db_test_bp, url_prefix="/api")
    app.register_blueprint(test_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api")

    return app
