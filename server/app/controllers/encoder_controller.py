from flask import request, jsonify
from app.model.encoder.budget_entries_db import (
    insert_budget_entries_db,
    get_budget_entries_db,
    put_budget_entries_db,
    delete_budget_entries_db,
)
from app.model.encoder.collections_db import (
    insert_collection_db,
    get_collection_db,
    put_collection_db,
    delete_collection_db,
    get_data_base_date_collection_db
)
from app.model.encoder.disbursements_db import (
    insert_disbursement_db,
    get_disbursement_db,
    put_disbursement_db,
    delete_disbursement_db,
    get_data_base_date_disbursement_db
)

from app.services.total_amount_calculation import (
    total_amount_budget_allocation,
    total_amount_collection,
    total_amount_disbursement,
)
#CALCULATIONS===========================================+
def get_total_amount_budget_allocation_controller():
    try:
        total_amount = total_amount_budget_allocation()
        return jsonify(total_amount), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def get_total_amount_collection_controller():
    try:
        total_amount = total_amount_collection()
        return jsonify(total_amount), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    
def get_total_amount_disbursement_controller():
    try:
        total_amount = total_amount_disbursement()
        return jsonify(total_amount), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500
 
# CRUD ==================================================
# BUDGET ENTRIES
def insert_budget_entries_controller():
    try:
        entries = request.get_json()

        if not entries:
            return jsonify({"message": "No entries provided"}), 400

        created_by = entries["created_by"]

        success = insert_budget_entries_db(entries, created_by)

        if success:
            return jsonify({"message": "Budget entry inserted successfully"}), 200
        else:
            return jsonify({"message": "Failed to insert budget entry"}), 500

    except Exception as e:
        return jsonify({"message": str(e)}), 500


def get_budget_entries_controller():
    ...
    try:
        data = request.get_json()
        year = data["year"]
        
        if not year:
            return jsonify({"message": "No year provided"}), 400

        entries = get_budget_entries_db(year)

        if entries:
            return jsonify(entries), 200
        else:
            return jsonify({"message": "No budget entries found for the given year"}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def update_budget_entries_controller():
    ...
    try:
        ...
        entry = request.get_json()

        if not entry:
            return jsonify({"message": "No entries provided"}), 400

        success = put_budget_entries_db(entry)

        if success:
            return jsonify({"message": "Budget entry updated successfully"}), 200
        else:
            return jsonify({"message": "There is no budget entry try to check the id"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    
def delete_budget_entries_controller():
    ...
    try:
        ...
        data = request.get_json()
        entry_id = data["id"]

        if not entry_id:
            return jsonify({"message": "No entry ID provided"}), 400

        success = delete_budget_entries_db(entry_id)

        if success:
            return jsonify({"message": "Budget entry deleted successfully"}), 200
        else:
            return jsonify({"message": "Failed to delete budget entry"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500
 
#COLLECTION 
def insert_disbursement_controller():
    ...
    try:
        ...
        entry = request.get_json()
        if not entry:
            return jsonify({"message": "No entries provided"}), 400
        
        success = insert_disbursement_db(entry)

        if success:
            return jsonify({"message": "disbursement entries inserted successfully"}), 200
        else:
            return jsonify({"message": "Failed to insert disbursement entries"}), 500  
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def get_disbursement_controller():
    ...
    try:
        ...
        disbursement = get_disbursement_db()
        if disbursement:
            return jsonify(disbursement), 200
        else:
            return jsonify({"message": "Failed to get disbursement"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def put_disbursement_controller():
    ...
    try:
        ...
        entry = request.get_json()
        if not entry:
            return jsonify({"message": "No entries provided"}), 400

        success = put_disbursement_db(entry)

        if success:
            return jsonify({"message": "disbursement entries updated successfully"}), 200
        else:
            return jsonify({"message": "There is no disbursement to update"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def delete_disbursement_controller():
    ...
    try:
        ...
        data = request.get_json()
        disbursement_id = data["disbursement_id"]
        success = delete_disbursement_db(disbursement_id)

        if success:
            return jsonify({"message": "disbursement entries deleted successfully"}), 200
        else:
            return jsonify({"message": "Failed to delete disbursement entries"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    
    
#DISBURSEMENT
def insert_collection_controller():
    ...
    try:
        ...
        entry = request.get_json()
        if not entry:
            return jsonify({"message": "No entries provided"}), 400
        
        success = insert_collection_db(entry)

        if success:
            return jsonify({"message": "Collection entries inserted successfully"}), 200
        else:
            return jsonify({"message": "Failed to insert collection entries"}), 500  
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def get_collection_controller():
    ...
    try:
        ...
        collection = get_collection_db()
        if collection:
            return jsonify(collection), 200
        else:
            return jsonify({"message": "Failed to get collection"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def put_collection_controller():
    ...
    try:
        ...
        entry = request.get_json()
        if not entry:
            return jsonify({"message": "No entries provided"}), 400

        success = put_collection_db(entry)

        if success:
            return jsonify({"message": "Collection entries updated successfully"}), 200
        else:
            return jsonify({"message": "There is no collection to update"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def delete_collection_controller():
    ...
    try:
        ...
        data = request.get_json()
        collection_id = data["collection_id"]
        success = delete_collection_db(collection_id)

        if success:
            return jsonify({"message": "Collection entries deleted successfully"}), 200
        else:
            return jsonify({"message": "Failed to delete collection entries"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def get_data_base_range_date_controller():
    try:
        ...
        data = request.get_json()
        start_date = data["start_date"]
        end_date = data["end_date"]
        data_name = data["data_name"]
        print(data)
        if data_name == "collection":
            result = get_data_base_date_collection_db(start_date, end_date)
            return jsonify({"message": "Successfully retrieved data", "data": result}), 200
        elif data_name == "disbursement":
            result = get_data_base_date_disbursement_db(start_date, end_date)
            return jsonify({"message": "Successfully retrieved data", "data": result}), 200
        else:
            return jsonify({"message": "Invalid data name"}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    

#DFE PROJECT  