from flask import Blueprint, jsonify, request
from app.controllers.encoder_controller import (
    insert_budget_entries_controller,
    get_budget_entries_controller,
    update_budget_entries_controller,
    delete_budget_entries_controller,
    insert_collection_controller,
    get_collection_controller,
    put_collection_controller,
    delete_collection_controller,
    insert_disbursement_controller,
    get_disbursement_controller,
    put_disbursement_controller,
    delete_disbursement_controller,
    get_data_base_range_date_controller,
    insert_dfur_controller,
    get_dfur_controller,
    put_dfur_controller,
    delete_dfur_controller,
    generate_transaction_id_controller,
    generate_11_digit_number_controller
)

encoder_bp = Blueprint('encoder_bp', __name__)

# CRUD ==================================================
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

# collection routes

@encoder_bp.route('/insert-collection', methods=['POST'])
def insert_collection():
    ...
    # {
    # "transaction_id": "COLL-2026-001",
    # "transaction_date": "2026-01-29",
    # "nature_of_collection": "Barangay Clearance",
    # "description": "Payment for barangay clearance",
    # "fund_source": "General Fund",
    # "amount": 150.00,
    # "payor": "Juan Dela Cruz",
    # "or_number": "OR-2026-0001",
    # "remarks": "Paid in cash",
    # "created_by": 4
    # }
    return insert_collection_controller()

@encoder_bp.route('/get-collection', methods=['GET'])
def view_collection():
    ...
    return get_collection_controller()

@encoder_bp.route('/put-collection', methods=['PUT'])
def put_collection():
    ...
      # {
    # "id": 4
    # "transaction_id": "COLL-2026-001",
    # "transaction_date": "2026-01-29",
    # "nature_of_collection": "Barangay Clearance",
    # "description": "Payment for barangay clearance",
    # "fund_source": "General Fund",
    # "amount": 150.00,
    # "payor": "Juan Dela Cruz",
    # "or_number": "OR-2026-0001",
    # "remarks": "Paid in cash",
    # }
    return put_collection_controller()

@encoder_bp.route('/delete-collection', methods=['DELETE'])
def delete_collection():
    ...
    # {
    #     "collection_id": 1
    # }
    return delete_collection_controller()

#disbursement

@encoder_bp.route('/insert-disbursement', methods=['POST'])
def insert_disbursement():
    ...
    # {
    # "transaction_id": "COLL-2026-001",
    # "transaction_date": "2026-01-29",
    # "nature_of_disbursement": "Barangay Clearance",
    # "description": "Payment for barangay clearance",
    # "fund_source": "General Fund",
    # "amount": 150.00,
    # "payee": "Juan Dela Cruz",
    # "or_number": "OR-2026-0001",
    # "remarks": "Paid in cash",
    # "created_by": 4,
    # "allocation_id": 1
    # }
    return insert_disbursement_controller()

@encoder_bp.route('/get-disbursement', methods=['GET'])
def view_disbursement():
    ...
    return get_disbursement_controller()

@encoder_bp.route('/put-disbursement', methods=['PUT'])
def put_disbursement():
    ...
    #   {
    # "id": 4
    # "transaction_id": "COLL-2026-001",
    # "transaction_date": "2026-01-29",
    # "nature_of_disbursement": "Barangay Clearance",
    # "description": "Payment for barangay clearance",
    # "fund_source": "General Fund",
    # "amount": 150.00,
    # "payor": "Juan Dela Cruz",
    # "or_number": "OR-2026-0001",
    # "remarks": "Paid in cash",
    # }
    return put_disbursement_controller()

@encoder_bp.route('/delete-disbursement', methods=['DELETE'])
def delete_disbursement():
    ...
    # {
    #     "disbursement_id": 1
    # }
    return delete_disbursement_controller()

@encoder_bp.route('/get-data-range', methods=["POST"])
def get_data_range():
    ...
    # {
    #     "start_date": "2022-01-01",
    #     "end_date": "2022-12-31",
    #     "data_name": "collections"
    # }
    return get_data_base_range_date_controller()

@encoder_bp.route('/insert-dfur-project', methods=['POST'])
def insert_dfur_project():
    ...
    # {
    #     "transaction_id": "COLL-2026-001",
    #     "transaction_date": "2026-01-22",
    #     "name_of_collection": "Barangay Road Improvement Fund",
    #     "project": "Concrete Road Rehabilitation Phase 1",
    #     "location": "Barangay San Isidro, District 2",
    #     "total_cost_approved": 1500000.00,
    #     "total_cost_incurred": 1487500.50,
    #     "date_started": "2025-11-15",
    #     "target_completion_date": "2026-02-15",
    #     "stats": "palnned",
    #     "no_extensions": 0,
    #     "remarks": "Project progressing on schedule; materials delivered"
    # }
    return insert_dfur_controller()

@encoder_bp.route('/get-dfur-project', methods=['GET'])
def get_dfur_project():
    ...
    return get_dfur_controller()

@encoder_bp.route('/update-dfur-project', methods=['PUT'])
def update_dfur_project():
    ...
    # {
    #     "id": "1",
    #     "transaction_id": "COLL-2026-001",
    #     "transaction_date": "2026-01-22",
    #     "name_of_collection": "Barangay Road Improvement Fund",
    #     "project": "Concrete Road Rehabilitation Phase 1",
    #     "location": "Barangay San Isidro, District 2",
    #     "total_cost_approved": 1500000.00,
    #     "total_cost_incurred": 1487500.50,
    #     "date_started": "2025-11-15",
    #     "target_completion_date": "2026-02-15",
    #     "stats": "palnned",
    #     "no_extensions": 0,
    #     "remarks": "Project progressing on schedule; materials delivered",
    #     "is_active": 1
    # }
    return put_dfur_controller()

@encoder_bp.route('/delete-dfur-project', methods=['DELETE'])
def delete_dfur_project():
    ...
    # {
    #     "id": "1"
    # }
    return delete_dfur_controller()

# generator
@encoder_bp.route('/budget-entries/generate_id', methods=['GET'])
def get_budget_entries_generator():
    data = {}
    data['transaction_id'] = generate_transaction_id_controller('BUDG', 'budget_entries')
    data['div_number'] = generate_11_digit_number_controller()
    return jsonify(data), 200

@encoder_bp.route('/collection/generate_id', methods=['GET'])
def get_collection_generator():
    ...
    data = {}
    data['transaction_id'] = generate_transaction_id_controller('COLL', 'collection')
    data['div_number'] = generate_11_digit_number_controller()
    return jsonify(data), 200

@encoder_bp.route('/disbursement/generate_id', methods=['GET'])
def get_disbursement_generator():
    ...
    data = {}
    data['transaction_id'] = generate_transaction_id_controller('DISB', 'disbursement')
    data['div_number'] = generate_11_digit_number_controller()
    return jsonify(data), 200

@encoder_bp.route('/dfur/generate_id', methods=['GET'])
def get_dfur_generator():
    ...
    data = {}
    data['transaction_id'] = generate_transaction_id_controller('DFUR', 'dfur')
    data['div_number'] = generate_11_digit_number_controller()
    return jsonify(data), 200