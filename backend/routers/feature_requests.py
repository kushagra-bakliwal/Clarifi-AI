"""
Feature Requests Router

GET /feature-requests  → returns all feature requests for the user's project
"""

from typing import Annotated
from fastapi import APIRouter, Depends

from auth import get_current_user
from services import db_service as db

router = APIRouter()
UserDep = Annotated[object, Depends(get_current_user)]


@router.get("")
async def get_feature_requests(user: UserDep):
    project = db.get_project_by_user_id(user.id)
    if not project:
        return {"success": True, "data": []}

    items = db.get_feature_requests_by_project(project["id"])

    # Normalise column names to match the frontend FeatureRequest interface:
    # DB has: title, description, votes, status, created_at
    # Frontend expects: feature, description, votes, status, date, source, requestedBy
    normalised = [
        {
            "id":          item["id"],
            "feature":     item.get("title") or item.get("feature_text") or "Untitled request",
            "description": item.get("description", ""),
            "votes":       item.get("votes", 1),
            "status":      item.get("status", "Under Review"),
            "date":        (item.get("created_at") or "")[:10],
            "source":      item.get("source", "CSV Upload"),
            "requestedBy": item.get("customer_name", "Customer"),
        }
        for item in items
    ]
    return {"success": True, "data": normalised}
