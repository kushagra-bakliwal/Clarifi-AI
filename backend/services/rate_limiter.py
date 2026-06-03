"""
Rate Limiter — checks usage_logs to enforce per-user monthly request limits.

Tiers:
  - free:     500 reviews/month,  50 chat queries/month
  - pro:      5000 reviews/month, 500 chat queries/month
  - business: unlimited

For now, all users default to 'free' tier.
A future billing integration can set the tier on the user's profile.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from fastapi import HTTPException, status

from auth import get_supabase

logger = logging.getLogger("clarifi.rate_limiter")

# ─── Tier Definitions ─────────────────────────────────────────────────────────

TIER_LIMITS: dict[str, dict[str, int | None]] = {
    "free": {
        "upload_csv": 500,       # reviews per month
        "chat_query": 50,        # chat queries per month
    },
    "pro": {
        "upload_csv": 5000,
        "chat_query": 500,
    },
    "business": {
        "upload_csv": None,      # unlimited
        "chat_query": None,
    },
}


def _get_user_tier(user_id: str) -> str:
    """
    Get the user's tier. For now, everyone is 'free'.
    Future: look up the user's subscription in the profiles or billing table.
    """
    # TODO: query profiles/billing table for subscription tier
    return "free"


def get_monthly_usage(user_id: str, action: str) -> int:
    """
    Count the total resource_count for a user+action in the current calendar month.
    """
    sb = get_supabase()
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()

    result = (
        sb.table("usage_logs")
        .select("resource_count")
        .eq("user_id", user_id)
        .eq("action", action)
        .gte("created_at", month_start)
        .execute()
    )

    rows = result.data or []
    return sum(row.get("resource_count", 1) for row in rows)


def check_rate_limit(user_id: str, action: str, requested_count: int = 1) -> None:
    """
    Check if the user has exceeded their monthly limit for the given action.
    Raises HTTP 429 if the limit would be exceeded.
    """
    tier = _get_user_tier(user_id)
    limits = TIER_LIMITS.get(tier, TIER_LIMITS["free"])
    limit = limits.get(action)

    if limit is None:
        # Unlimited tier
        return

    current_usage = get_monthly_usage(user_id, action)
    remaining = limit - current_usage

    if requested_count > remaining:
        logger.warning(
            "Rate limit exceeded: user=%s action=%s usage=%d/%d requested=%d",
            user_id, action, current_usage, limit, requested_count,
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "Monthly limit exceeded",
                "action": action,
                "tier": tier,
                "limit": limit,
                "used": current_usage,
                "remaining": max(0, remaining),
                "message": f"You've used {current_usage}/{limit} {action.replace('_', ' ')}s this month. "
                           f"Upgrade to Pro for higher limits.",
            },
        )


def log_usage(user_id: str, action: str, resource_count: int = 1) -> None:
    """
    Record usage in the usage_logs table after a successful action.
    """
    sb = get_supabase()
    try:
        sb.table("usage_logs").insert({
            "user_id": user_id,
            "action": action,
            "resource_count": resource_count,
        }).execute()
        logger.info("Usage logged: user=%s action=%s count=%d", user_id, action, resource_count)
    except Exception as e:
        # Don't fail the request if logging fails — just warn
        logger.warning("Failed to log usage: user=%s action=%s error=%s", user_id, action, e)
