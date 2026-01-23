from flask import Blueprint, jsonify

test_bp = Blueprint("test_bp", __name__)

@test_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "OK",
        "message": "Flask backend is running 🚀"
    })
