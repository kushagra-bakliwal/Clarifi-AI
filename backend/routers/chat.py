"""
Chat Router — AI-powered chat with the user's review data.

POST /chat   → { query: string } → { response: string }
"""

from __future__ import annotations
from typing import Annotated
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from auth import get_current_user
from services import db_service as db
from services import ai_service as ai

router = APIRouter()
UserDep = Annotated[object, Depends(get_current_user)]


class ChatRequest(BaseModel):
    query: str


@router.post("")
async def chat(body: ChatRequest, user: UserDep):
    project = db.get_project_by_user_id(user.id)
    if not project:
        return {"success": True, "data": {"response": "No data uploaded yet. Please upload a CSV to get started."}}

    reviews = db.get_reviews_by_project(project["id"])
    completed = [r for r in reviews if r.get("status") == "completed"]

    if not completed:
        return {
            "success": True,
            "data": {"response": "Reviews are still being analyzed. Please check back shortly."},
        }

    # Build a short summary context for the model
    total     = len(completed)
    positive  = sum(1 for r in completed if r.get("sentiment") == "positive")
    negative  = sum(1 for r in completed if r.get("sentiment") == "negative")
    critical  = sum(1 for r in completed if r.get("priority") == "critical")
    features  = sum(1 for r in completed if r.get("is_feature_request"))
    avg_rat   = sum(r.get("rating") or 3 for r in completed) / total

    # Collect a sample of recent summaries for context
    sample_summaries = [r.get("summary") or r.get("text", "")[:80] for r in completed[:20]]

    context = f"""
You have access to {total} customer reviews.
- Positive: {positive}, Negative: {negative}, Neutral: {total - positive - negative}
- Average rating: {avg_rat:.1f}/5
- Critical issues: {critical}
- Feature requests: {features}

Recent review summaries:
{chr(10).join(f'- {s}' for s in sample_summaries if s)}
"""

    prompt = f"""{context}

User question: {body.query}

Answer concisely based on the review data above. If the question cannot be answered from the data, say so clearly."""

    try:
        # Call the new OpenRouter client helper from the AI service
        answer = await ai.call_openrouter(prompt, response_format_json=False)
    except Exception as e:
        print(f"[Chat] OpenRouter failed ({e}), using rule-based fallback.")
        # Fallback: rule-based response
        answer = _rule_based_chat(body.query, total, positive, negative, critical, features, avg_rat)

    return {"success": True, "data": {"response": answer}}


def _rule_based_chat(query: str, total: int, positive: int, negative: int,
                     critical: int, features: int, avg_rating: float) -> str:
    q = query.lower()
    if any(w in q for w in ["sentiment", "feel", "positive", "negative"]):
        return (f"Based on {total} reviews: {positive} positive ({round(positive/total*100)}%), "
                f"{negative} negative ({round(negative/total*100)}%). Overall sentiment is "
                f"{'positive' if positive > negative else 'negative' if negative > positive else 'neutral'}.")
    if any(w in q for w in ["critical", "urgent", "issue", "problem", "bug"]):
        return f"There are {critical} critical issues detected across {total} reviews."
    if any(w in q for w in ["feature", "request", "wish", "want"]):
        return f"{features} feature requests were identified in the reviews."
    if any(w in q for w in ["rating", "score", "star"]):
        return f"The average rating across {total} reviews is {avg_rating:.1f} out of 5."
    return (f"Summary: {total} reviews analyzed. Average rating: {avg_rating:.1f}/5. "
            f"{positive} positive, {negative} negative. {critical} critical issues, {features} feature requests.")
