from flask import Blueprint
from app.controllers.db_test_controller import test_db_connection

db_test_bp = Blueprint("db_test_bp", __name__)

db_test_bp.route("/test-db", methods=["GET"])(test_db_connection)
