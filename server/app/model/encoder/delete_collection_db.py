from app.database.connection import get_db_connection

def delete_collection_db(collection_id):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("DELETE FROM collections WHERE collection_id = %s", (collection_id,))
    db.commit()
    cursor.close()
    db.close()