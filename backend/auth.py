"""
Authentication helper — validates Supabase JWT tokens
and returns the authenticated user.
"""

import os
from fastapi import Header, HTTPException, status
from supabase import create_client, Client

_supabase: Client | None = None


def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        if not url or not key:
            raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
        _supabase = create_client(url, key)
    return _supabase


async def get_current_user(authorization: str = Header(...)):
    """
    FastAPI dependency: extracts and validates the Bearer token.
    Returns the Supabase user object or raises 401.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )

    token = authorization.removeprefix("Bearer ").strip()
    supabase = get_supabase()

    try:
        # Use get_user() — always makes a live network call, never stale
        response = supabase.auth.get_user(token)
        if response is None or response.user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return response.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}",
        )
