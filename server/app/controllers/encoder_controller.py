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

        # Wrap single entry into a lis

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
        return jsonify({"message": "Budget entries retrieved successfully"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500