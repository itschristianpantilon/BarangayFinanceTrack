from app.utils.execute_query import execute_query

def insert_comment_db(name, email, comment):
    try:
        ...
        query = """
            INSERT INTO viewer_comments (name, email, comment)
            VALUES (%s, %s, %s)
        """
        return execute_query(query, (name, email, comment,)) == 1
    except Exception as e:
        print(e)
        return False