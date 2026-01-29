from app.database.connection import get_db_connection

def insert_budget_entries_db(entries, created_by):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            INSERT INTO budget_entries (
                transaction_id,
                transaction_date,
                category,
                subcategory,
                amount,
                fund_source,
                payee,
                dv_number,
                expenditure_program,
                program_description,
                remarks,
                allocation_id,
                created_by
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,  %s)
        """
        cursor.execute(query, (
            entries["transaction_id"],
            entries["transaction_date"],
            entries["category"],
            entries.get("subcategory"),
            entries["amount"],
            entries.get("fund_source"),
            entries.get("payee"),
            entries.get("dv_number"),
            entries.get("expenditure_program"),
            entries.get("program_description"),
            entries.get("remarks"),
            entries.get("allocation_id"),
            created_by
        ))

        conn.commit()
        conn.close()
        return cursor.rowcount == 1

    except Exception as e:
        print(f"Error inserting budget entries: {e}")
        return False
