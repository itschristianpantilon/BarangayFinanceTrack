from app.utils.execute_query import execute_query

def insert_collection_db(collection):
    query = """
        INSERT INTO collections (
            transaction_id,
            transaction_date,
            nature_of_collection,
            description,
            fund_source,
            amount,
            payor,
            or_number,
            remarks,
            created_by
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    params = (
        collection["transaction_id"],
        collection["transaction_date"],
        collection.get("nature_of_collection"),
        collection.get("description"),
        collection.get("fund_source"),
        collection["amount"],
        collection.get("payor"),
        collection.get("or_number"),
        collection.get("remarks"),
        collection["created_by"]
    )

    return execute_query(query, params) == 1
