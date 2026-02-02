from app.database.connection import get_db_connection
from app.utils.execute_query import execute_query   

def put_collection_approval_db(collection_id, review_status):
    ...
    try:
        ...
        query = """
            UPDATE collections
            SET review_status = %s
            WHERE id = %s
        """
        return execute_query(query, (review_status, collection_id))
    except Exception as e:
        print(e)
        return False


def put_disbursement_approval_db(disbursement_id, review_status):
    ...
    try:
        ...
        query = """
            UPDATE disbursements
            SET review_status = %s
            WHERE id = %s
        """
        return execute_query(query, (review_status, disbursement_id))
    except Exception as e:
        print(e)
        return False
    
    
def put_dfur_approval_db(dfur_id, review_status):
    ...
    try:
        ...
        query = """
            UPDATE dfur_projects
            SET review_status = %s
            WHERE id = %s
        """
        return execute_query(query, (review_status, dfur_id))
    except Exception as e:
        print(e)
    