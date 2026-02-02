from flask import request, jsonify
from app.model.approver.insert_approval_db import (
    put_collection_approval_db,
    put_disbursement_approval_db,
    put_dfur_approval_db
)

def approver_controller():
    ...
    try:
        ...
        data = request.get_json()
        approval_type = data.get('approval_type')
        review_status = data.get('review_status')
        
        if approval_type == 'collection':
            collection_id = data.get('collection_id')
            approval = put_collection_approval_db(collection_id, review_status)
            if approval:
                return jsonify({'message': 'Collection approval updated successfully'}), 200
            else:
                return jsonify({'message': 'Failed to update collection approval'}), 400
        elif approval_type == 'disbursement':
            disbursement_id = data.get('disbursement_id')
            approval = put_disbursement_approval_db(disbursement_id, review_status)
            if approval:
                return jsonify({'message': 'Disbursement approval updated successfully'}), 200
            else:
                return jsonify({'message': 'Failed to update disbursement approval'}), 400
        elif approval_type == 'dfur':
            dfur_id = data.get('dfur_id')
            approval = put_dfur_approval_db(dfur_id, review_status)
            if approval:
                return jsonify({'message': 'DFUR approval updated successfully'}), 200
            else:
                return jsonify({'message': 'Failed to update DFUR approval'}), 400
        else:
            return jsonify({'error': 'Invalid approval type'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500