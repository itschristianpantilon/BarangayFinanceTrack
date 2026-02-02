from flask import Blueprint
from app.controllers.approver_controller import approver_controller

approver_bp = Blueprint('approver_bp', __name__)

@approver_bp.route('/put-approval', methods=['POST'])
def post_approver():
    # Get the approver information from the database
    {
        "collection_id": 1,
        "review_status": "approved",
        "approval_type": "collection"
    }
    return approver_controller()