from flask import request, jsonify
from app.model.viewer.insert_comment_db import (
    insert_comment_db
)

def insert_comment_controller():
    ...
    try:
        ...
        data = request.get_json()
        name = data['name']
        email = data['email']
        comment = data['comment']
        
        success = insert_comment_db(name, email, comment)
        if success:
            return jsonify({'message': 'Comment inserted successfully'}), 200
        else:
            return jsonify({'message': 'Failed to insert comment'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500