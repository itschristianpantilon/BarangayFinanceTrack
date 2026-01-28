from app.database.connection import get_db_connection

def update_user(user_id, user_data):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        query = """
            UPDATE users
            SET role = %s,
                full_name = %s,
                position = %s,
                is_active = %s
            WHERE id = %s
        """

        cursor.execute(
            query,
            (
                user_data["role"],
                user_data["fullname"],
                user_data["position"],
                user_data["is_active"],
                user_id
            )
        )

        connection.commit()

        # check if a row was actually updated
        success = cursor.rowcount == 1

        cursor.close()
        connection.close()

        return success

    except Exception as e:
        print(f"Error updating user: {e}")
        return False


def update_user_password(user_id, password):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        query = """
            UPDATE users
            SET password = %s
            WHERE id = %s
        """

        cursor.execute(
            query,
            (password, user_id)
        )

        connection.commit()

        success = cursor.rowcount == 1

        cursor.close()
        connection.close()

        return success

    except Exception as e:
        print(f"Error updating user password: {e}")
        return False
