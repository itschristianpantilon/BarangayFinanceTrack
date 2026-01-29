from app.database.connection import get_db_connection

def put_budget_entries_db(entry):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            UPDATE budget_entries
            SET
                transaction_id = %s,
                transaction_date = %s,
                category = %s,
                subcategory = %s,
                amount = %s,
                fund_source = %s,
                payee = %s,
                dv_number = %s,
                expenditure_program = %s,
                program_description = %s,
                remarks = %s
           WHERE id = %s
        """
        cursor.execute(query, (
            entry["transaction_id"],
            entry["transaction_date"],
            entry["category"],
            entry.get("subcategory"),
            entry["amount"],
            entry.get("fund_source"),
            entry.get("payee"),
            entry.get("dv_number"),
            entry.get("expenditure_program"),
            entry.get("program_description"),
            entry.get("remarks"),
            entry["id"] 
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return cursor.rowcount == 1
    except Exception as e:
        print("Error: ", e)
        return False