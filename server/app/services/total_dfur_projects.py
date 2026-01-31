from app.model.encoder.dfur_db import get_all_dfur_db

def total_dfur_projects():
    try:
        ...
        return len(get_all_dfur_db())
    except Exception as e:
        print(e)
        return 0

def total_approved_budget():
    try:
        ...
        return sum(item["total_cost_approved"] for item in get_all_dfur_db())
    except Exception as e:
        print(e)
        return 0

def total_active_projects():
    try:
        ...
        return len([item for item in get_all_dfur_db() if item["is_active"] == 1])
    except Exception as e:
        print(e)
        return 0