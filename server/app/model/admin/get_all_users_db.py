from app.utils.execute_query import fetch_all

def get_all_users():
    try:
        query = """
            SELECT 
                id,
                username,
                full_name,
                position,
                role,
                is_active
            FROM users
        """
        return fetch_all(query)
    except Exception as e:
        print(e)
        return None
