from app.database.connection import get_db_connection

def insert_collection_db(collection):
    try: 
        conn = get_db_connection()
        cursor = conn.cursor()
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
        cursor.execute(query, (
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
        ))
        conn.commit()
        conn.close()
        return cursor.rowcount == 1
    except Exception as e:
        print(e)
        return None
    