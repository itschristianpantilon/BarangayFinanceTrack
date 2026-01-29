from app.utils.execute_query import execute_query, fetch_all

def insert_budget_entries_db(entries, created_by):
    try:
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
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        params = (
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
        )

        return execute_query(query, params) == 1

    except Exception as e:
        print(f"Error inserting budget entries: {e}")
        return False


def get_budget_entries_db(year):
    try:
        query = """
            SELECT
                be.id,
                be.transaction_id,
                be.transaction_date,
                ba.category AS allocation_category,
                be.subcategory,
                be.expenditure_program,
                be.payee,
                be.dv_number,
                be.amount,
                ba.year
            FROM budget_entries be
            JOIN budget_allocations ba
                ON be.allocation_id = ba.id
            WHERE ba.year = %s
            ORDER BY be.transaction_date DESC
        """

        return fetch_all(query, (year,))
    except Exception as e:
        print(f"Error fetching budget entries: {e}")
        return None


def put_budget_entries_db(entry):
    try:
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

        affected = execute_query(query, (
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

        return affected == 1
    except Exception as e:
        print("Error: ", e)
        return False

def delete_budget_entries_db(entry_id):
    try:
        query = "DELETE FROM budget_entries WHERE id = %s"
        affected = execute_query(query, (entry_id,))
        return affected == 1
    except Exception as e:
        print(f"Error deleting budget entry: {e}")
        return False
