"""
test_csv_upload.py — Uploads the dataset CSV directly to the FastAPI backend for testing.

Usage:
  1. Make sure the backend is running: uvicorn main:app --reload
  2. Run: python test_csv_upload.py [path/to/file.csv]

The script signs in as a Supabase test user (or creates one) using the
service-role key, gets a JWT, then POSTs the CSV to /reviews/upload-csv.
"""

import os
import sys
import json
import requests
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

# ── Config ────────────────────────────────────────────────────────────────────
load_dotenv(Path(__file__).parent / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
API_BASE = "http://localhost:8000"

# Test credentials — change these to any valid user in your Supabase project
TEST_EMAIL = os.getenv("TEST_EMAIL", "test@clarifi.local")
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "TestPassword123!")

# Default CSV path — can be overridden via CLI arg
DATASET_DIR = Path(__file__).parent.parent / "dataset"
DEFAULT_CSV = DATASET_DIR / "sample_reviews.csv"

# ── Helpers ───────────────────────────────────────────────────────────────────

def get_or_create_test_user(sb) -> str:
    """Sign in or create a test Supabase user and return their JWT access token."""
    # Try sign in first
    try:
        resp = sb.auth.sign_in_with_password({"email": TEST_EMAIL, "password": TEST_PASSWORD})
        if resp.session:
            print(f"✅ Signed in as: {TEST_EMAIL}")
            return resp.session.access_token
    except Exception as e:
        print(f"⚠  Sign-in failed ({e}), trying to create user...")

    # Create user via admin API
    try:
        admin_resp = sb.auth.admin.create_user({
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "email_confirm": True,
        })
        print(f"✅ Created test user: {TEST_EMAIL}")
        # Sign in after creation
        resp = sb.auth.sign_in_with_password({"email": TEST_EMAIL, "password": TEST_PASSWORD})
        return resp.session.access_token
    except Exception as e:
        print(f"❌ Could not create user: {e}")
        sys.exit(1)


def check_backend() -> bool:
    """Ping the backend health endpoint."""
    try:
        r = requests.get(f"{API_BASE}/health", timeout=3)
        if r.ok:
            print(f"✅ Backend is running: {r.json()}")
            return True
    except requests.exceptions.ConnectionError:
        pass
    print("❌ Backend is NOT running. Start it with: uvicorn main:app --reload")
    return False


def upload_csv(csv_path: Path, token: str) -> dict:
    """Upload the CSV file to /reviews/upload-csv and return the JSON response."""
    print(f"\n📤 Uploading: {csv_path.name} ({csv_path.stat().st_size / 1024:.1f} KB)")
    with open(csv_path, "rb") as f:
        resp = requests.post(
            f"{API_BASE}/reviews/upload-csv",
            headers={"Authorization": f"Bearer {token}"},
            files={"file": (csv_path.name, f, "text/csv")},
            timeout=30,
        )
    return resp


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    csv_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_CSV

    if not csv_path.exists():
        print(f"❌ File not found: {csv_path}")
        sys.exit(1)

    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env")
        sys.exit(1)

    # 1. Check backend is alive
    if not check_backend():
        sys.exit(1)

    # 2. Get a JWT for the test user
    sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    token = get_or_create_test_user(sb)

    # 3. Upload the CSV
    resp = upload_csv(csv_path, token)

    # 4. Print result
    print(f"\n📨 Status: {resp.status_code}")
    try:
        data = resp.json()
        print(json.dumps(data, indent=2))
        if resp.ok:
            count = data.get("data", {}).get("count", 0)
            print(f"\n🎉 Success! {count} reviews uploaded and queued for AI analysis.")
            print("   Check the dashboard — results will appear via Supabase Realtime.")
        else:
            print(f"\n❌ Upload failed: {data.get('detail') or data.get('error')}")
    except Exception:
        print(resp.text)


if __name__ == "__main__":
    main()
