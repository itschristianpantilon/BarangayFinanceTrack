from app.utils.execute_query import execute_query
from app.utils.execute_query import fetch_all

from app.utils.execute_query import execute_query

def insert_collection_db(collection):
    try:
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
    except Exception as e:
        print(f"Error inserting collection: {e}")
        return False

def get_collection_db():
    try:
        query = """
            SELECT *
            FROM collections
            ORDER BY created_at DESC
        """
        return fetch_all(query)
    except Exception as e:
        print(e)
        return None

def put_collection_db(collection):
    try:
        query = """
            UPDATE collections
            SET
                transaction_id = %s,
                transaction_date = %s,
                nature_of_collection = %s,
                description = %s,
                fund_source = %s,
                amount = %s,
                payor = %s,
                or_number = %s,
                remarks = %s
            WHERE id = %s
        """

        affected = execute_query(query, (
            collection["transaction_id"],
            collection["transaction_date"],
            collection.get("nature_of_collection"),
            collection.get("description"),
            collection.get("fund_source"),
            collection["amount"],
            collection.get("payor"),
            collection.get("or_number"),
            collection.get("remarks"),
            collection["id"]  # collection primary key
        ))

        return affected == 1

    except Exception as e:
        print("Error updating collection:", e)
        return False

def delete_collection_db(collection_id):
    query = "DELETE FROM collections WHERE id = %s"
    return execute_query(query, (collection_id,)) == 1

def get_data_base_date_collection_db(start_date, end_date):
    try:
        query = """
            SELECT * FROM collections
            WHERE transaction_date >= %s
            AND transaction_date < DATE_ADD(%s, INTERVAL 1 DAY)
        """
        return fetch_all(query, (start_date, end_date))
    except Exception as e:
        print("Error getting collections:", e)
        return []