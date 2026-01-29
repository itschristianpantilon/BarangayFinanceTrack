from app.utils.execute_query import fetch_all

def get_user_by_username(username):
    try:
        query = """
            SELECT id, username, password, role
            FROM users
            WHERE username = %s
            LIMIT 1
        """

        result = fetch_all(query, (username,))
        return result[0] if result else None
    except Exception as e:
        print(f"Error getting user by username: {e}")
        return None
    

def get_users(username, password):
    try:
        query = """
            SELECT *
            FROM users
            WHERE username = %s AND password = %s
            LIMIT 1
        """

        result = fetch_all(query, (username, password))
        return result[0] if result else None
    except Exception as e:
        print(f"Error getting user by username and password: {e}")
        return None
