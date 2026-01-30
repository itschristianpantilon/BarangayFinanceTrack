from app.model.encoder.collections_db import get_collection_db
from app.model.encoder.disbursements_db import get_disbursement_db
from app.model.encoder.budget_entries_db import get_budget_entries_db

def total_amount_budget_allocation(year=2026):
    try:
        ...
        total_amount = 0
        for budget in get_budget_entries_db(year):
            total_amount += budget["amount"]
        return total_amount
    except Exception as e:
        print(e)
        return 0

def total_amount_collection():
    try:
        ...
        total_amount = 0
        for collection in get_collection_db():
            total_amount += collection["amount"]
        return total_amount
    except Exception as e:
        print(e)
        return 0

def total_amount_disbursement():
    try:
        ...
        total_amount = 0
        for disbursement in get_disbursement_db():
            total_amount += disbursement["amount"]
        return total_amount
    except Exception as e:
        print(e)
        return 0