"""
Reviews Router — handles CSV upload, background AI processing, and fetching.

POST /reviews/upload-csv  → saves pending rows, starts background processing
GET  /reviews             → returns all reviews for the user's project
DELETE /reviews           → clears all data for the project
"""

from __future__ import annotations
import csv
import io
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, BackgroundTasks

from auth import get_current_user
from services import db_service as db
from services import ai_service as ai
from services import kpi_service as kpis

router = APIRouter()

UserDep = Annotated[object, Depends(get_current_user)]


# ─── Upload CSV ────────────────────────────────────────────────────────────────

@router.post("/upload-csv")
async def upload_csv(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user: object = Depends(get_current_user),
):
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted")

    content = await file.read()
    try:
        text = content.decode("utf-8-sig")  # handles BOM encoding
    except UnicodeDecodeError:
        text = content.decode("latin-1")

    rows = _parse_csv(text)
    if not rows:
        raise HTTPException(status_code=400, detail="No data rows found in CSV")

    # Get or create the user's project
    project = db.get_or_create_project(user.id, getattr(user, "email", None))

    # Build review rows to insert as 'pending'
    reviews_to_insert = []
    for idx, row in enumerate(rows):
        review_text = _pick(row, ["review text", "reviewtext", "review", "text", "comment", "feedback", "body", "message"])
        if not review_text:
            continue

        rating_raw = _pick(row, ["rating", "stars", "score", "star_rating"])
        try:
            rating = int(round(float(rating_raw))) if rating_raw else None
            if rating is not None and not (1 <= rating <= 5):
                rating = None
        except (ValueError, TypeError):
            rating = None

        raw_date = _pick(row, ["date", "created_at", "timestamp", "review_date"])
        parsed_date = _safe_date(raw_date)

        reviews_to_insert.append({
            "project_id":    project["id"],
            "text":          review_text,
            "rating":        rating or 3,
            "date":          parsed_date,
            "customer_name": _pick(row, ["customer name", "customername", "name", "customer", "author", "user"]) or f"Customer {idx + 1}",
            "source":        _pick(row, ["source", "platform", "channel", "store"]) or "CSV Upload",
            "status":        "pending",
        })

    if not reviews_to_insert:
        raise HTTPException(
            status_code=400,
            detail='No review text found. Ensure your CSV has a column named "review", "text", "comment", or "feedback".',
        )

    # Save all rows as 'pending' — frontend Realtime will show them immediately
    saved = db.save_reviews(reviews_to_insert)

    # Start background analysis — FastAPI's BackgroundTasks is proper and won't be GC'd (fixes Bug #6)
    background_tasks.add_task(_run_analysis, project["id"], saved)

    return {
        "success": True,
        "message": f"Uploaded {len(saved)} reviews. AI analysis has started in the background.",
        "data": {
            "count":     len(saved),
            "projectId": project["id"],
        },
    }


# ─── Background Analysis Worker ───────────────────────────────────────────────

async def _run_analysis(project_id: str, saved_reviews: list[dict]) -> None:
    """
    Processes reviews in batches:
    1. Mark as 'processing' (triggers Realtime UPDATE → UI shows spinner)
    2. Run Ollama analysis
    3. Save results + keywords, mark 'completed' (triggers Realtime UPDATE → UI shows data)
    4. Recalculate full KPIs and save to kpi_cache (triggers Realtime UPDATE → Dashboard refreshes)
    """
    BATCH_SIZE = 5  # Bigger than the old 3; still manageable for Ollama

    for i in range(0, len(saved_reviews), BATCH_SIZE):
        batch = saved_reviews[i : i + BATCH_SIZE]

        # Mark as processing
        for r in batch:
            try:
                db.update_review(r["id"], {"status": "processing"})
            except Exception as e:
                print(f"[Worker] Could not mark review {r['id']} as processing: {e}")

        # Run AI
        try:
            ai_results = await ai.analyze_reviews([
                {"text": r["text"], "rating": r.get("rating")} for r in batch
            ])
        except Exception as e:
            print(f"[Worker] AI analysis failed for batch {i}: {e}")
            for r in batch:
                db.update_review(r["id"], {"status": "failed"})
            continue

        # Save results
        for j, review in enumerate(batch):
            result = ai_results[j] if j < len(ai_results) else None
            if not result:
                db.update_review(review["id"], {"status": "failed"})
                continue
            try:
                db.update_review(review["id"], {
                    "sentiment":          result.get("sentiment", "neutral"),
                    "sentiment_score":    result.get("sentiment_score", 0.5),
                    "summary":            result.get("summary", review["text"][:100]),
                    "is_urgent":          result.get("is_urgent", False),
                    "priority":           result.get("priority", "medium"),
                    "is_feature_request": result.get("is_feature_request", False),
                    "feature_text":       result.get("feature_text"),
                    "status":             "completed",
                })
                # Save keywords — fix Bug #9: stored separately, not in the review row
                keywords = result.get("keywords") or []
                if keywords:
                    db.save_keywords([
                        {"review_id": review["id"], "keyword": kw}
                        for kw in keywords if kw
                    ])
            except Exception as e:
                print(f"[Worker] Failed to save analysis for review {review['id']}: {e}")
                db.update_review(review["id"], {"status": "failed"})

        batch_num = i // BATCH_SIZE + 1
        total_batches = (len(saved_reviews) + BATCH_SIZE - 1) // BATCH_SIZE
        print(f"[Worker] Completed batch {batch_num}/{total_batches}")

    # Full KPI recalculation — fixes Bug #5
    try:
        kpis.recalculate_and_save_kpis(project_id)
        print(f"[Worker] KPI recalculation complete for project {project_id}")
    except Exception as e:
        print(f"[Worker] KPI recalculation failed: {e}")


# ─── Get Reviews ──────────────────────────────────────────────────────────────

@router.get("")
async def get_reviews(user: UserDep):
    project = db.get_project_by_user_id(user.id)
    if not project:
        return {"success": True, "data": []}
    reviews = db.get_reviews_by_project(project["id"])
    # Flatten keywords from [{keyword: "x"}] to ["x"] for frontend compatibility
    for r in reviews:
        r["keywords"] = [k["keyword"] if isinstance(k, dict) else k for k in (r.get("keywords") or [])]
    return {"success": True, "data": reviews}


# ─── Delete All Data ──────────────────────────────────────────────────────────

@router.delete("")
async def delete_all_data(user: UserDep):
    project = db.get_project_by_user_id(user.id)
    if project:
        db.clear_project_data(project["id"])
    return {"success": True, "message": "All data cleared."}


# ─── CSV Parser ───────────────────────────────────────────────────────────────

def _parse_csv(text: str) -> list[dict]:
    reader = csv.DictReader(io.StringIO(text))
    rows = []
    for row in reader:
        # Normalize all keys to lowercase stripped strings
        rows.append({k.strip().lower(): v.strip() for k, v in row.items() if k})
    return rows


def _pick(row: dict, keys: list[str]) -> str | None:
    for k in keys:
        v = row.get(k)
        if v:
            return v.strip()
    return None


def _safe_date(raw: str | None) -> str:
    today = date.today().isoformat()
    if not raw:
        return today
    raw = raw.strip()
    # Try ISO format (YYYY-MM-DD)
    try:
        d = date.fromisoformat(raw.split("T")[0])
        return d.isoformat()
    except ValueError:
        pass
    # Try MM/DD/YYYY
    parts_slash = raw.split("/")
    if len(parts_slash) == 3:
        try:
            d = date(int(parts_slash[2]), int(parts_slash[0]), int(parts_slash[1]))
            return d.isoformat()
        except ValueError:
            pass
    # Try DD-MM-YYYY (used in sample_reviews.csv dataset)
    parts_dash = raw.split("-")
    if len(parts_dash) == 3 and len(parts_dash[2]) == 4:
        try:
            d = date(int(parts_dash[2]), int(parts_dash[1]), int(parts_dash[0]))
            return d.isoformat()
        except ValueError:
            pass
    return today
