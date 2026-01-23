from flask import jsonify
from app.database.connection import get_db_connection

def test_db_connection():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()

        cursor.close()
        conn.close()

        return jsonify({
            "status": "success",
            "message": "Database connection successful"
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
