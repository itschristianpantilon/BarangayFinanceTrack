from app.database.connection import get_db_connection
from app.utils.execute_query import execute_query, fetch_all

def insert_dfur_db(data):
    try:
        query = """
            INSERT INTO dfur_projects (
                transaction_id, 
                transaction_date, 
                name_of_collection, 
                project, 
                location,
                total_cost_approved,
                total_cost_incurred,
                date_started,
                target_completion_date,
                status,
                no_extensions,
                remarks
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            data['transaction_id'],
            data['transaction_date'],
            data['name_of_collection'],
            data['project'],
            data['location'],
            data['total_cost_approved'],
            data['total_cost_incurred'],
            data['date_started'],
            data['target_completion_date'],
            data['status'],
            data['no_extensions'],
            data['remarks']
        )
        return execute_query(query, params)
    except Exception as e:
        print("Insert DFRU error:", e)
        return False


def get_all_dfur_db():
    try:
        ...
        query = """ 
            SELECT * FROM dfur_projects;
        """
        return fetch_all(query)
    except Exception as e:
        print("Get all DFRU error:", e)
        return None
    
def put_dfur_db(data):
   try:
       ...
       query = """
           UPDATE dfur_projects SET
               transaction_id = %s,
               transaction_date = %s,
               name_of_collection = %s,
               project = %s,
               location = %s,
               total_cost_approved = %s,
               total_cost_incurred = %s,
               date_started = %s,
               target_completion_date = %s,
               status = %s,
               no_extensions = %s,
               remarks = %s,
               is_active = %s
           WHERE id = %s;
       """
       params = (
           data['transaction_id'],
           data['transaction_date'],
           data['name_of_collection'],
           data['project'],
           data['location'],
           data['total_cost_approved'],
           data['total_cost_incurred'],
           data['date_started'],
           data['target_completion_date'],
           data['status'],
           data['no_extensions'],
           data['remarks'],
           data['is_active'],
           data['id']
       )
       return execute_query(query, params)
   except Exception as e:
       print("Update DFRU error:", e)
       return False

def delete_dfur_db(id):
   try:
       query = """
           DELETE FROM dfur_projects
           WHERE id = %s;
       """
       params = (id,)
       return execute_query(query, params)
   except Exception as e:
       print("Delete DFRU error:", e)
       return False