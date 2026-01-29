from flask import jsonify, request
from app.utils.hash_password import hash_password
from app.model.admin.get_all_users_db import get_all_users
from app.model.admin.insert_user_db import insert_user
from app.model.admin.put_user_db import update_user, update_user_password, delete_user
from app.validator.validate_user import (
    validate_user,
    validate_put_user                      
)

def get_all_users_controller():
    try:
        ...
        data = get_all_users()
        if not data:
            return jsonify({"error": "No users found"}), 404
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 404
    
def add_user_controller():
    try:
        ...
        user = request.get_json()
        #validate is_active
        if user["is_active"] == "active":
            user["is_active"] = True
        else:
            user["is_active"] = False
        # validation for user data
        is_valid, message = validate_user(user)
        if not is_valid:
            return jsonify({"error": message}), 400

        if not is_valid:
            return jsonify(is_valid), 400
    
        user["password"] = hash_password(user["password"])
        
        success = insert_user(user)
        if success:
            return jsonify({"message": "User added successfully"}), 200
        else:
            return jsonify({"error": "User already exists"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 404
    
def edit_user_controller():
    try:
        ...
        user = request.get_json()
        user_id = user["user_id"]
         #validate is_active
        if user["is_active"] == "active":
            user["is_active"] = True
        else:
            user["is_active"] = False
        #validation for data
        is_valid, message = validate_put_user(user)
        if not is_valid:
            return jsonify({"error": message}), 400

        
        success = update_user(user_id, user)
        
         # update password ONLY if provided
        if "password" in user and user["password"]:
            hashed = hash_password(user["password"])
            update_user_password(user_id, hashed)
        
        if success:
            return jsonify({"message": "User edited successfully"}), 200
        else:
            return jsonify({"error": "User already updated"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 404
    
def delete_user_controller():
    try:
        ...
        user_id = request.get_json()["user_id"]
        if not user_id:
            return jsonify({"error": "User id is required"}), 400

        success = delete_user(user_id)

        if success:
            return jsonify({"message": "User deleted successfully"}), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 404