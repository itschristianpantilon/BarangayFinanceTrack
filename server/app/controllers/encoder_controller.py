from flask import request, jsonify
from app.model.encoder.insert_budget_entries_db import insert_budget_entries_db
from app.model.encoder.get_budget_entries_db import get_budget_entries_db
from app.model.encoder.put_budget_entries_db import put_budget_entries_db
from app.model.encoder.delete_budget_entries_db import delete_budget_entries_db
from app.model.encoder.insert_collection_db import insert_collection_db
from app.model.encoder.get_collection_db import get_collection_db
from app.model.encoder.put_collection_db import put_collection_db
from app.model.encoder.delete_collection_db import delete_collection_db
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
            return jsonify({"message": "Failed to update budget entry"}), 500
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
            return jsonify({"message": "Failed to update collection entries"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def delete_collection_controller():
    ...
    try:
        ...
        success = delete_collection_db()

        if success:
            return jsonify({"message": "Collection entries deleted successfully"}), 200
        else:
            return jsonify({"message": "Failed to delete collection entries"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500
#DISBURSEMENT



#DFE PROJECT  
