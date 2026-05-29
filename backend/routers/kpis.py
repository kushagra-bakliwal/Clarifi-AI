"""
KPIs Router — returns computed analytics for the user's project.

GET /kpis       → returns full KPI object (from kpi_cache)
POST /kpis/recalculate → force recalculation
"""

from typing import Annotated
from fastapi import APIRouter, Depends

from auth import get_current_user
from services import db_service as db
from services import kpi_service as kpis

router = APIRouter()
UserDep = Annotated[object, Depends(get_current_user)]


@router.get("")
async def get_kpis(user: UserDep):
    project = db.get_project_by_user_id(user.id)
    if not project:
        return {"success": True, "data": None}
    data = db.get_kpis_by_project(project["id"])
    return {"success": True, "data": data}


@router.post("/recalculate")
async def recalculate(user: UserDep):
    project = db.get_project_by_user_id(user.id)
    if not project:
        return {"success": False, "message": "No project found"}
    data = kpis.recalculate_and_save_kpis(project["id"])
    return {"success": True, "data": data}
