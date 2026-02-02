from flask import Blueprint
from app.controllers.checker_controller import (
    insert_flag_comment_controller,
)

checker_bp = Blueprint('checker_bp', __name__)

@checker_bp.route('/put-flag-comment', methods=['POST'])
def insert_flag_comment():
    ...
    # {
    #     "collection_id": 1,
    #     "reviewed_by": 3,
    #     "comment": "The project has been flagged due to missing supporting documents. Kindly submit the required attachments to proceed with approval.",
    #     "flag_type": "collection"
    # }
     # {
    #     "disbursement_id": 1,
    #     "reviewed_by": 3,
    #     "comment": "The project has been flagged due to missing supporting documents. Kindly submit the required attachments to proceed with approval.",
    #     "flag_type": "disbursement"
    # }
     # {
    #     "dfur_id": 1,
    #     "reviewed_by": 3,
    #     "comment": "The project has been flagged due to missing supporting documents. Kindly submit the required attachments to proceed with approval.",
    #     "flag_type": "dfur"
    # }
    return insert_flag_comment_controller()
