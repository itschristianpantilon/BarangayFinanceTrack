from app.database.connection import get_db_connection

def delete_budget_entries_db(entry_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM budget_entries WHERE id = %s", (entry_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return cursor.rowcount == 1
    except Exception as e:
        print(f"Error deleting budget entry: {e}")
        return False
    