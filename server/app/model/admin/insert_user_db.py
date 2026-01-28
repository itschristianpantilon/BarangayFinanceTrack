from app.database.connection import get_db_connection

def insert_user(user):
    try:
        db = get_db_connection()
        cursor = db.cursor()

        query = """
            INSERT INTO users
            (username, password, role, full_name, position, is_active)
            VALUES (%s, %s, %s, %s, %s, %s)
        """

        cursor.execute(
            query,
            (
                user["username"],
                user["password"],
                user["role"],
                user["fullname"],
                user["position"],
                user["is_active"]
            )
        )

        db.commit()

        success = cursor.rowcount == 1

        cursor.close()
        db.close()

        return success

    except Exception as e:
        print("Insert user error:", e)
        return False
