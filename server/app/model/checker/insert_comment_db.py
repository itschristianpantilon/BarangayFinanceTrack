from app.database.connection import get_db_connection
from app.utils.execute_query import execute_query

def insert_collection_comment_db(collection_id, reviewed_by, comment):
    try:
        query = """
            UPDATE collections
            SET
                is_flagged = 1,
                review_comment = %s,
                reviewed_by = %s,
                reviewed_at = NOW()
            WHERE id = %s
        """
        params = (
            comment,
            reviewed_by,
            collection_id
        )
        return execute_query(query, params)

    except Exception as e:
        print("Insert comment error:", e)
        return False
    
def insert_disbursement_comment_db(disbursement_id, reviewed_by, comment):
    try:
        query = """
            UPDATE disbursements SET
                is_flagged = 1,
                review_comment = %s,
                reviewed_by = %s,
                reviewed_at = NOW()
            WHERE id = %s
        """
        params = (
            comment,
            reviewed_by,
            disbursement_id
        )
        return execute_query(query, params)

    except Exception as e:
        print("Insert comment error:", e)
        return False

def insert_dfur_comment_db(dfur_id, reviewed_by, comment):
    try:
        query = """
            UPDATE dfur_projects
            SET
                is_flagged = 1,
                review_comment = %s,
                reviewed_by = %s,
                reviewed_at = NOW()
            WHERE id = %s
        """
        params = (
            comment,
            reviewed_by,
            dfur_id
        )
        return execute_query(query, params)

    except Exception as e:
        print("Insert comment error:", e)
        return False

