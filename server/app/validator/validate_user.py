def validate_user(user):
    # user must exist and be a dict
    if not user or not isinstance(user, dict):
        return False, "Invalid user payload"

    required_fields = [
        "username",
        "password",
        "fullname",
        "position",
        "role",
        "is_active"
    ]

    # Check required fields
    for field in required_fields:
        if field not in user:
            return False, f"Missing field: {field}"

        # Empty string check (except is_active)
        if field != "is_active" and not str(user[field]).strip():
            return False, f"{field} cannot be empty"

    # Password rules
    # if len(user["password"]) < 8:
    #     return False, "Password must be at least 8 characters"

    # Role whitelist (adjust to your system)
    allowed_roles = {"admin", "superadmin", "encoder", "checker", "reviewer", "approver"}
    if user["role"] not in allowed_roles:
        return False, "Invalid role"

    # is_active must be boolean
    if not isinstance(user["is_active"], bool):
        return False, "is_active must be true or false"

    return True, "Valid user"

def validate_put_user(user):
     # user must exist and be a dict
    if not user or not isinstance(user, dict):
        return False, "Invalid user payload"

    required_fields = [
        "fullname",
        "position",
        "role",
        "is_active"
    ]

    # Check required fields
    for field in required_fields:
        if field not in user:
            return False, f"Missing field: {field}"

        # Empty string check (except is_active)
        if field != "is_active" and not str(user[field]).strip():
            return False, f"{field} cannot be empty"

    # Role whitelist (adjust to your system)
    allowed_roles = {"admin", "superadmin", "encoder", "checker", "reviewer", "approver"}
    if user["role"] not in allowed_roles:
        return False, "Invalid role"

    # is_active must be boolean
    if not isinstance(user["is_active"], bool):
        return False, "is_active must be true or false"

    return True, "Valid user"

