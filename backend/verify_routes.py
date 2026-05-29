import os, json, requests
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(Path(__file__).parent / "backend" / ".env")
sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
resp = sb.auth.sign_in_with_password({"email": "test@clarifi.local", "password": "TestPassword123!"})
token = resp.session.access_token
headers = {"Authorization": f"Bearer {token}"}

for path in ["/feature-requests", "/recommendations"]:
    r = requests.get(f"http://localhost:8000{path}", headers=headers)
    data = r.json()
    items = data.get("data", [])
    print(f"\n{path}: HTTP {r.status_code} -> {len(items)} items")
    if items:
        print(json.dumps(items[0], indent=2)[:400])
