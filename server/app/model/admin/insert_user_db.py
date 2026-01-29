from app.utils.execute_query import execute_query

def insert_user(user):
    try:
        query = """
            INSERT INTO users
            (username, password, role, full_name, position, is_active)
            VALUES (%s, %s, %s, %s, %s, %s)
        """

        affected = execute_query(query, (
            user["username"],
            user["password"],
            user["role"],
            user["fullname"],
            user["position"],
            user["is_active"]
        ))

        return affected == 1
    except Exception as e:
        print(e)
        return False
