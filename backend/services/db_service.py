"""
Database service — all Supabase PostgreSQL operations.
Uses the service-role key so we can bypass RLS inside the trusted backend.
Row-level security is still enforced on the FRONTEND via the anon key.
"""

from __future__ import annotations
from typing import Any
from auth import get_supabase


# ─── Profile ──────────────────────────────────────────────────────────────────

def ensure_profile_exists(user_id: str, email: str | None = None) -> None:
    sb = get_supabase()
    result = sb.table("profiles").select("id").eq("id", user_id).maybe_single().execute()
    if result is None or result.data is None:
        sb.table("profiles").insert({
            "id": user_id,
            "email": email,
            "onboarding_completed": False
        }).execute()


def get_profile(user_id: str) -> dict | None:
    sb = get_supabase()
    result = sb.table("profiles").select("*").eq("id", user_id).maybe_single().execute()
    return result.data if result else None


def update_profile(user_id: str, updates: dict) -> dict | None:
    sb = get_supabase()
    result = sb.table("profiles").update(updates).eq("id", user_id).execute()
    return result.data[0] if result and result.data else None


# ─── Projects ─────────────────────────────────────────────────────────────────

def get_project_by_user_id(user_id: str) -> dict | None:
    sb = get_supabase()
    result = (
        sb.table("projects")
        .select("*")
        .eq("user_id", user_id)
        .limit(1)
        .maybe_single()
        .execute()
    )
    return result.data if result else None


def create_default_project(user_id: str, email: str | None = None, name: str = "Default Project") -> dict:
    ensure_profile_exists(user_id, email)
    sb = get_supabase()
    result = (
        sb.table("projects")
        .insert({"user_id": user_id, "name": name})
        .execute()
    )
    return result.data[0]


def get_or_create_project(user_id: str, email: str | None = None) -> dict:
    project = get_project_by_user_id(user_id)
    if project is None:
        project = create_default_project(user_id, email)
    return project


# ─── Reviews ──────────────────────────────────────────────────────────────────

def save_reviews(reviews: list[dict]) -> list[dict]:
    sb = get_supabase()
    result = sb.table("reviews").insert(reviews).execute()
    return result.data or []


def update_review(review_id: str, updates: dict) -> dict | None:
    sb = get_supabase()
    result = sb.table("reviews").update(updates).eq("id", review_id).execute()
    return result.data[0] if result.data else None


def get_reviews_by_project(project_id: str) -> list[dict]:
    sb = get_supabase()
    result = (
        sb.table("reviews")
        .select("*, keywords(keyword)")
        .eq("project_id", project_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


# ─── Keywords ─────────────────────────────────────────────────────────────────

def save_keywords(keywords: list[dict]) -> None:
    if not keywords:
        return
    sb = get_supabase()
    # Use upsert to avoid duplicate keyword errors on re-runs
    sb.table("keywords").upsert(keywords).execute()


# ─── KPI Cache ────────────────────────────────────────────────────────────────

def upsert_kpi_cache(project_id: str, data: dict) -> None:
    from datetime import datetime, timezone
    sb = get_supabase()
    sb.table("kpi_cache").upsert({
        "project_id": project_id,
        "data": data,
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }).execute()


def get_kpis_by_project(project_id: str) -> dict | None:
    sb = get_supabase()
    result = (
        sb.table("kpi_cache")
        .select("data")
        .eq("project_id", project_id)
        .maybe_single()
        .execute()
    )
    return result.data["data"] if (result and result.data) else None


# ─── Feature Requests ─────────────────────────────────────────────────────────

def save_feature_requests(items: list[dict]) -> None:
    if not items:
        return
    sb = get_supabase()
    sb.table("feature_requests").upsert(items).execute()


def get_feature_requests_by_project(project_id: str) -> list[dict]:
    sb = get_supabase()
    result = sb.table("feature_requests").select("*").eq("project_id", project_id).execute()
    return result.data or []


# ─── Recommendations ──────────────────────────────────────────────────────────

def save_recommendations(items: list[dict]) -> None:
    if not items:
        return
    sb = get_supabase()
    # Delete old recs for this project and insert fresh ones
    project_id = items[0].get("project_id")
    if project_id:
        sb.table("recommendations").delete().eq("project_id", project_id).execute()
    sb.table("recommendations").insert(items).execute()


def get_recommendations_by_project(project_id: str) -> list[dict]:
    sb = get_supabase()
    result = sb.table("recommendations").select("*").eq("project_id", project_id).execute()
    return result.data or []


# ─── Data Management ──────────────────────────────────────────────────────────

def clear_project_data(project_id: str) -> None:
    sb = get_supabase()
    sb.table("reviews").delete().eq("project_id", project_id).execute()
    sb.table("recommendations").delete().eq("project_id", project_id).execute()
    sb.table("feature_requests").delete().eq("project_id", project_id).execute()
    sb.table("kpi_cache").delete().eq("project_id", project_id).execute()
