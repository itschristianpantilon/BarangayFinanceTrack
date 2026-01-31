from flask import request, jsonify
from app.model.checker.insert_comment_db import (
    insert_collection_comment_db,
    insert_disbursement_comment_db,
    insert_dfur_comment_db,
)

def insert_flag_comment_collection_controller():
    ...
    try:
        ...
        data = request.get_json()
        collection_id = data['collection_id']
        reviewed_by = data['reviewed_by']
        comment = data['comment']
        
        if insert_comment_db(collection_id, reviewed_by, comment):
            return jsonify({'message': 'Comment inserted successfully'}), 200
        else:
            return jsonify({'message': 'Failed to insert comment'}), 500
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    
def insert_flag_comment_disbursement_controller():
    ...
    try:
        ...
        data = request.get_json()
        disbursement_id = data['disbursement_id']
        reviewed_by = data['reviewed_by']
        comment = data['comment']
        
        if insert_disbursement_comment_db(disbursement_id, reviewed_by, comment):
            return jsonify({'message': 'Comment inserted successfully'}), 200
        else:
            return jsonify({'message': 'Failed to insert comment'}), 500
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    
def insert_flag_comment_dfur_controller():
    ...
    try:
        ...
        data = request.get_json()
        dfur_id = data['dfur_id']
        reviewed_by = data['reviewed_by']
        comment = data['comment']
        
        if insert_dfur_comment_db(dfur_id, reviewed_by, comment):
            return jsonify({'message': 'Comment inserted successfully'}), 200
        else:
            return jsonify({'message': 'Failed to insert comment'}), 500
    except Exception as e:
        return jsonify({'message': str(e)}), 500