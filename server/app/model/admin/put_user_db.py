from app.utils.execute_query import execute_query

def update_user(user_id, user_data):
    try:
        query = """
            UPDATE users
            SET role = %s,
                full_name = %s,
                position = %s,
                is_active = %s
            WHERE id = %s
        """

        affected = execute_query(query, (
            user_data["role"],
            user_data["fullname"],
            user_data["position"],
            user_data["is_active"],
            user_id
        ))

        return affected == 1
    except Exception as e:
        print(e)
        return False
    

def update_user_password(user_id, password):
    try:
        query = """
            UPDATE users
            SET password = %s
            WHERE id = %s
        """

        affected = execute_query(query, (password, user_id))
        return affected == 1
    except Exception as e:
        print(e)
        return False

def delete_user(user_id):
    try:
        query = """
            UPDATE users
            SET is_active = FALSE
            WHERE id = %s
        """

        affected = execute_query(query, (user_id,))
        return affected == 1
    except Exception as e:
        print(e)
        return False
