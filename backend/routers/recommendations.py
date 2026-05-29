"""
Recommendations Router

GET /recommendations  → returns all AI recommendations for the user's project
"""

from typing import Annotated
from fastapi import APIRouter, Depends

from auth import get_current_user
from services import db_service as db

router = APIRouter()
UserDep = Annotated[object, Depends(get_current_user)]


@router.get("")
async def get_recommendations(user: UserDep):
    project = db.get_project_by_user_id(user.id)
    if not project:
        return {"success": True, "data": []}

    items = db.get_recommendations_by_project(project["id"])

    # Normalise snake_case DB columns → camelCase frontend interface
    normalised = [
        {
            "id":              item["id"],
            "title":           item.get("title", ""),
            "description":     item.get("description", ""),
            "impact":          item.get("impact", "medium"),
            "priority":        item.get("priority", "medium"),
            "category":        item.get("category", ""),
            "affectedArea":    item.get("affected_area", ""),
            "estimatedEffort": item.get("estimated_effort", ""),
            "affectedUsers":   item.get("affected_users", 0),
            "detectedPattern": item.get("detected_pattern", ""),
            "actionable":      True,
            "icon":            item.get("icon", "zap"),
        }
        for item in items
    ]
    return {"success": True, "data": normalised}
