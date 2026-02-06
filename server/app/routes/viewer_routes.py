from flask import Blueprint
from app.controllers.viewer_controller import (
    insert_comment_controller
)

viewer_bp = Blueprint('viewer_bp', __name__)

@viewer_bp.route('/insert-comment', methods=['POST'])
def insert_comment():
    return insert_comment_controller()
