from flask import Blueprint
from app.controllers.encoder_controller import (
    insert_budget_entries_controller,
    get_budget_entries_controller,
    update_budget_entries_controller,
    delete_budget_entries_controller
)

encoder_bp = Blueprint('encoder_bp', __name__)

@encoder_bp.route('/post-budget-entries', methods=['POST'])
def post_budget_entries():
    ...
    # {
    #   "created_by": 2,
    #   "transaction_id": "BUDG-2026-001",
    #   "transaction_date": "2026-01-15",
    #   "category": "A. Personal Services",
    #   "subcategory": "Honoraria",
    #   "amount": 2628010.00,
    #   "fund_source": "General Fund",
    #   "payee": "Juan Dela Cruz",
    #   "dv_number": "DV-2026-001",
    #   "expenditure_program": "Personnel Services",
    #   "program_description": "Payment of honoraria for barangay officials",
    #   "remarks": "January 2026 payout",
    #   "allocation_id": 1
    # }
    return insert_budget_entries_controller()

@encoder_bp.route('/get-budget-entries', methods=['POST'])
def view_budget_entries():
    ...
    #  {
    # "year": 2026
    # }
    return get_budget_entries_controller()

@encoder_bp.route('/put-budget-entries', methods=['PUT'])
def put_budget_entries():
    ...
    return update_budget_entries_controller()

@encoder_bp.route('/delete-budget-entries', methods=['DELETE'])
def delete_budget_entries():
    ...
    return delete_budget_entries_controller()

