from functools import wraps
from flask import request, jsonify

def basic_middleware(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # simple check (example: API key or login flag)
        api_key = request.headers.get("X-API-KEY")

        if not api_key:
            return jsonify({"message": "Unauthorized"}), 401

        return fn(*args, **kwargs)
    return wrapper
