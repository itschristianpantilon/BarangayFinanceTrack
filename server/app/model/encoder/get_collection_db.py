from app.utils.execute_query import fetch_all

def get_collection_db():
    query = """
        SELECT *
        FROM collections
        ORDER BY created_at DESC
    """
    return fetch_all(query)
