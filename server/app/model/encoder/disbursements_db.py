from app.utils.execute_query import execute_query
from app.utils.execute_query import fetch_all

from app.utils.execute_query import execute_query

def insert_disbursement_db(disbursement):
    ...
    try:
        ...
        query = """
            INSERT INTO disbursements (
                transaction_id,
                transaction_date,
                nature_of_disbursement,
                description,
                fund_source,
                amount,
                payee,
                or_number,
                remarks,
                created_by,
                allocation_id  
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        params = (
           disbursement["transaction_id"],
           disbursement["transaction_date"],
           disbursement.get("nature_of_disbursement"),
           disbursement.get("description"),
           disbursement.get("fund_source"),
           disbursement["amount"],
           disbursement.get("payee"),
           disbursement.get("or_number"),
           disbursement.get("remarks"),
           disbursement["created_by"],
           disbursement["allocation_id"]
        )

        return execute_query(query, params) == 1
    except Exception as e:
        print(e)
        return False

def get_disbursement_db():
    try:
        query = """
            SELECT *
            FROM disbursements
            ORDER BY created_at DESC
        """
        return fetch_all(query)
    except Exception as e:
        print(e)
        return None

def put_disbursement_db(disbursement):
    try:
        query = """
            UPDATE disbursements
            SET
                transaction_id = %s,
                transaction_date = %s,
                nature_of_disbursement = %s,
                description = %s,
                fund_source = %s,
                amount = %s,
                payee = %s,
                or_number = %s,
                remarks = %s
            WHERE id = %s
        """
        params = (
            disbursement["transaction_id"],
            disbursement["transaction_date"],
            disbursement.get("nature_of_disbursement"),
            disbursement.get("description"),
            disbursement.get("fund_source"),
            disbursement["amount"],
            disbursement.get("payee"),
            disbursement.get("or_number"),
            disbursement.get("remarks"),
            disbursement["id"]  # disbursement primary key
        )
        
        return execute_query(query, params) == 1


    except Exception as e:
        print("Error updating disbursement:", e)
        return False

def delete_disbursement_db(disbursement_id):
    query = "DELETE FROM disbursements WHERE id = %s"
    return execute_query(query, (disbursement_id,)) == 1

def get_data_base_date_disbursement_db(start_date, end_date):
    try:
        query = """
            SELECT * FROM disbursements
            WHERE transaction_date >= %s
            AND transaction_date < DATE_ADD(%s, INTERVAL 1 DAY)
        """
        return fetch_all(query, (start_date, end_date))
    except Exception as e:
        print("Error getting disbursements:", e)
        return []