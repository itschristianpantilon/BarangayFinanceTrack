from app.database.connection import get_db_connection

def get_budget_entries_db(year):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
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
    """, (year,))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows
