from app.database.connection import get_db_connection

def get_all_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT 
                id
                username,
                full_name,
                position, 
                role,
                is_active
            FROM users
        """
        cursor.execute(query)
        users = cursor.fetchall()
        cursor.close()
        conn.close()
        return users
    except Exception as e:
        print(e)
        return None