from flask import request, jsonify
from app.model.checker.insert_comment_db import (
    insert_collection_comment_db,
    insert_disbursement_comment_db,
    insert_dfur_comment_db,
)

def insert_flag_comment_controller():
    ...
    try:
        ...
        data = request.get_json()
        reviewed_by = data['reviewed_by']
        comment = data['comment']
        flag_type = data['flag_type']
        
        if flag_type == 'collection':
            collection_id = data['collection_id']
            if insert_collection_comment_db(collection_id, reviewed_by, comment):
                return jsonify({'message': 'Comment inserted successfully'}), 200
            else:
                return jsonify({'message': 'Failed to insert comment'}), 500
        elif flag_type == 'disbursement':
            disbursement_id = data['disbursement_id']
            if insert_disbursement_comment_db(disbursement_id, reviewed_by, comment):
                return jsonify({'message': 'Comment inserted successfully'}), 200
            else:
                return jsonify({'message': 'Failed to insert comment'}), 500
        elif flag_type == 'dfur':
            dfur_id = data['dfur_id']
            if insert_dfur_comment_db(dfur_id, reviewed_by, comment):
                return jsonify({'message': 'Comment inserted successfully'}), 200
            else:
                return jsonify({'message': 'Failed to insert comment'}), 500
        else:
            return jsonify({'message': 'Invalid flag type'}), 400
    
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    
