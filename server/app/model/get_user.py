from app.database.connection import get_db_connection

def get_users(username, password):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
                    SELECT *
                    FROM users
                    WHERE username = %s AND password = %s
                    LIMIT 1
                """
        cursor.execute(query, (username, password))
        data = cursor.fetchone()
        cursor.close()
        conn.close()

        return data
    except Exception as e:
        return f"error {e}"
    
def get_user_by_username(username):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT id, username, password, role FROM users WHERE username = %s",
            (username,)
        )
        user = cursor.fetchone()

        cursor.close()
        conn.close()

        return user
    except Exception as e:
        return f"error {e}"
   