from flask import request, jsonify
from app.model.encoder.insert_budget_entries_db import insert_budget_entries_db
from app.model.encoder.get_budget_entries_db import get_budget_entries_db

from flask import request, jsonify

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