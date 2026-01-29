from app.database.connection import get_db_connection

def fetch_all(query, params=None, dictionary=True):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=dictionary)

    cursor.execute(query, params or ())
    results = cursor.fetchall()

    cursor.close()
    conn.close()

    return results

def execute_query(query, params=None):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(query, params or ())
    conn.commit()

    affected_rows = cursor.rowcount

    cursor.close()
    conn.close()

    return affected_rows

