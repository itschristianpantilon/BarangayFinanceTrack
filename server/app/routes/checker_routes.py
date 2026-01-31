from flask import Blueprint
from app.controllers.checker_controller import (
    insert_flag_comment_collection_controller,
    insert_flag_comment_disbursement_controller,
    insert_flag_comment_dfur_controller
)

checker_bp = Blueprint('checker_bp', __name__)

@checker_bp.route('/insert-flag-comment-collection', methods=['POST'])
def insert_flag_comment():
    ...
    # {
    #     "collection_id": 1,
    #     "reviewed_by": 3,
    #     "comment": "The project has been flagged due to missing supporting documents. Kindly submit the required attachments to proceed with approval."
    # }
    return insert_flag_comment_controller()

@checker_bp.route('/insert-flag-comment-disbursement', methods=['POST'])
def insert_flag_comment_disbursement():
    ...
    return insert_flag_comment_disbursement_controller()

@checker_bp.route('/insert-flag-comment-dfur', methods=['POST'])
def insert_flag_comment_dfur():
    ...
    return insert_flag_comment_dfur_controller()
