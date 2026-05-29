"""
KPI Service — full analytics calculations.
This fixes Bug #5: processor.tsx only computed 4 basic stats.
Now computes ALL dashboard data: sentimentTrend, topicBreakdown,
funnelStats, recommendations, and keyword cloud.
"""

from __future__ import annotations
from datetime import datetime
from collections import defaultdict
from services import db_service as db


MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

TOPIC_KEYWORDS = {
    "Performance":      ["slow","lag","freeze","speed","loading","performance","crash","hang","heavy","battery","memory","latency","timeout"],
    "Bugs & Errors":    ["error","bug","broken","glitch","problem","fail","wrong","blank","incorrect","missing","corrupted","issue"],
    "UI/UX":            ["confusing","complicated","difficult","hard","ugly","design","interface","layout","navigation","intuitive","cluttered","menu"],
    "Pricing":          ["expensive","cost","price","pricing","cheap","overpriced","affordable","subscription","plan","money","charge","billing","refund"],
    "Customer Support": ["support","response","help","team","service","assist","reply","ticket","contact","agent","chat","email"],
    "Feature Requests": ["feature","integrate","integration","wish","missing","request","add","want","export","import","automation","api"],
}

TOPIC_COLORS = {
    "Performance":      "#ef4444",
    "Bugs & Errors":    "#f59e0b",
    "UI/UX":            "#8b5cf6",
    "Pricing":          "#eab308",
    "Customer Support": "#6366f1",
    "Feature Requests": "#10b981",
    "Other":            "#6b7280",
}


# ─── Main Entry Point ─────────────────────────────────────────────────────────

def recalculate_and_save_kpis(project_id: str) -> dict:
    """Full KPI recalculation from all reviews in the project. Saves to kpi_cache."""
    reviews = db.get_reviews_by_project(project_id)

    # Only count completed reviews for analytics
    completed = [r for r in reviews if r.get("status") == "completed"]
    total = len(reviews)
    completed_count = len(completed)

    if total == 0:
        kpis = _empty_kpis()
        db.upsert_kpi_cache(project_id, kpis)
        return kpis

    positive  = [r for r in completed if r.get("sentiment") == "positive"]
    negative  = [r for r in completed if r.get("sentiment") == "negative"]
    neutral   = [r for r in completed if r.get("sentiment") == "neutral"]
    critical  = [r for r in completed if r.get("priority") == "critical"]
    features  = [r for r in completed if r.get("is_feature_request")]

    avg_rating    = sum(r.get("rating") or 3 for r in completed) / completed_count if completed_count else 0
    avg_sentiment = sum(r.get("sentiment_score") or 0.5 for r in completed) / completed_count if completed_count else 0.5

    # Keyword cloud (negative reviews only)
    neg_kw_map: dict[str, int] = defaultdict(int)
    for r in negative:
        for kw_obj in (r.get("keywords") or []):
            kw = kw_obj.get("keyword") if isinstance(kw_obj, dict) else kw_obj
            if kw:
                neg_kw_map[kw] += 1
    top_neg_keywords = [
        {"text": k, "value": v}
        for k, v in sorted(neg_kw_map.items(), key=lambda x: -x[1])[:25]
    ]

    sentiment_trend   = _calc_sentiment_trend(completed)
    topic_breakdown   = _calc_topic_breakdown(completed)
    funnel_stats      = _calc_funnel(total, completed_count, len(critical), len(features), completed)
    recommendations   = _generate_recommendations(completed, len(critical), len(negative), len(features), total, topic_breakdown)

    # Save feature requests to their table
    if features:
        feature_items = [
            {
                "project_id": project_id,
                "title":      r.get("feature_text") or (r.get("text", "")[:100]),
                "description": r.get("text", ""),
                "votes":      1,
                "status":     "Under Review",
            }
            for r in features
        ]
        try:
            db.save_feature_requests(feature_items)
        except Exception as e:
            print(f"[KPI] Could not save feature requests: {e}")

    # Save recommendations to their table
    if recommendations:
        rec_items = [
            {
                "project_id":     project_id,
                "title":          r["title"],
                "description":    r["description"],
                "impact":         r["impact"],
                "priority":       r["priority"],
                "category":       r["category"],
                "affected_area":  r["affectedArea"],
                "estimated_effort": r["estimatedEffort"],
                "affected_users": r["affectedUsers"],
                "detected_pattern": r["detectedPattern"],
                "icon":           r["icon"],
            }
            for r in recommendations
        ]
        try:
            db.save_recommendations(rec_items)
        except Exception as e:
            print(f"[KPI] Could not save recommendations: {e}")

    kpis = {
        "totalReviews":        total,
        "completedReviews":    completed_count,
        "positiveReviews":     len(positive),
        "negativeReviews":     len(negative),
        "neutralReviews":      len(neutral),
        "avgRating":           f"{avg_rating:.2f}",
        "avgSentiment":        f"{avg_sentiment:.2f}",
        "criticalIssues":      len(critical),
        "featureRequests":     len(features),
        "topNegativeKeywords": top_neg_keywords,
        "sentimentTrend":      sentiment_trend,
        "topicBreakdown":      topic_breakdown,
        "funnelStats":         funnel_stats,
        "recommendations":     recommendations,
        "lastUpdated":         datetime.utcnow().isoformat() + "Z",
    }

    db.upsert_kpi_cache(project_id, kpis)
    return kpis


# ─── Sentiment Trend ──────────────────────────────────────────────────────────

def _calc_sentiment_trend(reviews: list[dict]) -> list[dict]:
    groups: dict[str, dict] = {}

    for r in reviews:
        try:
            d = datetime.fromisoformat(str(r.get("date") or r.get("created_at", "")).replace("Z", "+00:00"))
        except Exception:
            d = datetime.utcnow()

        sort_key = f"{d.year}-{d.month:02d}"
        label    = f"{MONTH_NAMES[d.month - 1]} {d.year}"

        if sort_key not in groups:
            groups[sort_key] = {"label": label, "sum_score": 0, "positive": 0, "negative": 0, "neutral": 0, "total": 0}

        g = groups[sort_key]
        g["sum_score"] += r.get("sentiment_score") or 0.5
        g["total"]     += 1
        s = r.get("sentiment")
        if s == "positive":  g["positive"] += 1
        elif s == "negative": g["negative"] += 1
        else:                 g["neutral"]  += 1

    return [
        {
            "date":     g["label"],
            "sentiment": round(g["sum_score"] / g["total"] * 10, 1),
            "positive":  g["positive"],
            "negative":  g["negative"],
            "neutral":   g["neutral"],
            "total":     g["total"],
        }
        for sort_key, g in sorted(groups.items())
    ]


# ─── Topic Breakdown ──────────────────────────────────────────────────────────

def _calc_topic_breakdown(reviews: list[dict]) -> list[dict]:
    counts: dict[str, int] = {t: 0 for t in TOPIC_KEYWORDS}
    counts["Other"] = 0

    for r in reviews:
        text  = (r.get("text") or "").lower()
        kws   = [k.get("keyword", "") if isinstance(k, dict) else k for k in (r.get("keywords") or [])]
        matched = False
        for topic, topic_kws in TOPIC_KEYWORDS.items():
            if any(kw in text or kw in kws for kw in topic_kws):
                counts[topic] += 1
                matched = True
                break
        if not matched:
            counts["Other"] += 1

    return [
        {"topic": t, "count": c, "color": TOPIC_COLORS.get(t, "#6b7280")}
        for t, c in sorted(counts.items(), key=lambda x: -x[1])
        if c > 0
    ]


# ─── Funnel Stats ─────────────────────────────────────────────────────────────

def _calc_funnel(total: int, completed: int, critical: int, features: int, reviews: list[dict]) -> list[dict]:
    categorized = sum(1 for r in reviews if r.get("keywords"))
    actionable  = min(critical + features, completed)
    safe_pct    = lambda n: round(n / total * 100) if total else 0

    return [
        {"name": "Received",    "count": total,      "percentage": 100},
        {"name": "Analyzed",    "count": completed,  "percentage": safe_pct(completed)},
        {"name": "Categorized", "count": categorized,"percentage": safe_pct(categorized)},
        {"name": "Actionable",  "count": actionable, "percentage": safe_pct(actionable)},
    ]


# ─── Recommendations ──────────────────────────────────────────────────────────

def _generate_recommendations(reviews: list[dict], critical_count: int, negative_count: int,
                               feature_count: int, total: int, topic_breakdown: list[dict]) -> list[dict]:
    recs = []

    if critical_count > 0:
        recs.append(_rec(
            id="rec_critical", title="Address Critical Issues Immediately",
            desc=f"{critical_count} critical issues detected. Immediate engineering review required.",
            impact="high", priority="critical", category="Bug Fix", area="Product Stability",
            effort="1-2 weeks", users=critical_count * 12, pattern=f"{critical_count} critical-priority reviews",
            icon="alert",
        ))

    if total > 0 and negative_count / total > 0.25:
        pct = round(negative_count / total * 100)
        recs.append(_rec(
            id="rec_negative", title="Investigate High Negative Sentiment",
            desc=f"{pct}% of reviews carry negative sentiment. Focus on top pain points.",
            impact="high", priority="high", category="UX Enhancement", area="Customer Satisfaction",
            effort="2-4 weeks", users=negative_count * 6, pattern=f"{pct}% negative reviews",
            icon="trend",
        ))

    TOPIC_MSGS = {
        "Performance":      ("Resolve Performance Bottlenecks", "Profile load time, optimize queries, add caching.", "2-3 weeks"),
        "Bugs & Errors":    ("Systematic Bug Triage", "Set up error tracking, fix top 3 recurring bugs.", "1-2 weeks"),
        "UI/UX":            ("Simplify Onboarding & Navigation", "Usability sessions, redesign nav hierarchy.", "3-5 weeks"),
        "Pricing":          ("Revisit Pricing Strategy", "Consider lower-tier plan or annual discount.", "1 week"),
        "Customer Support": ("Improve Support Response Time", "Auto-responses, expand hours, self-service KB.", "2-3 weeks"),
        "Feature Requests": ("Prioritize Top Feature Backlog", "Public roadmap, announce top 3 upcoming features.", "4-8 weeks"),
    }

    top_topic = next((t for t in topic_breakdown if t["topic"] != "Other"), None)
    if top_topic and top_topic["count"] >= 2 and top_topic["topic"] in TOPIC_MSGS:
        name, desc, effort = TOPIC_MSGS[top_topic["topic"]]
        pct = round(top_topic["count"] / total * 100) if total else 0
        recs.append(_rec(
            id=f"rec_topic_{top_topic['topic'].replace(' ','_')}",
            title=name, desc=f"{pct}% of reviews mention {top_topic['topic'].lower()}. {desc}",
            impact="high", priority="high", category=top_topic["topic"], area=top_topic["topic"],
            effort=effort, users=top_topic["count"] * 8,
            pattern=f"{top_topic['count']} reviews ({pct}%) mention {top_topic['topic'].lower()}",
            icon="zap",
        ))

    if feature_count > 0:
        recs.append(_rec(
            id="rec_features", title="Publish a Public Product Roadmap",
            desc=f"{feature_count} feature requests detected. Publishing a roadmap builds trust.",
            impact="medium", priority="medium", category="Product Strategy", area="Roadmap & Retention",
            effort="1 week", users=feature_count * 4, pattern=f"{feature_count} feature requests",
            icon="zap",
        ))

    if total > 5 and negative_count < total * 0.15:
        pos_pct = round((total - negative_count) / total * 100)
        recs.append(_rec(
            id="rec_positive", title="Leverage Positive Sentiment for Growth",
            desc=f"{pos_pct}% positive sentiment. Add NPS surveys and referral program.",
            impact="medium", priority="medium", category="Growth", area="Retention & Acquisition",
            effort="1-2 weeks", users=total * 3, pattern=f"Only {round(negative_count/total*100)}% negative",
            icon="trend",
        ))

    return recs


def _rec(**kwargs) -> dict:
    return {
        "id":              kwargs["id"],
        "title":           kwargs["title"],
        "description":     kwargs["desc"],
        "impact":          kwargs["impact"],
        "priority":        kwargs["priority"],
        "category":        kwargs["category"],
        "affectedArea":    kwargs["area"],
        "estimatedEffort": kwargs["effort"],
        "affectedUsers":   kwargs["users"],
        "detectedPattern": kwargs["pattern"],
        "actionable":      True,
        "icon":            kwargs["icon"],
    }


def _empty_kpis() -> dict:
    return {
        "totalReviews": 0, "completedReviews": 0,
        "positiveReviews": 0, "negativeReviews": 0, "neutralReviews": 0,
        "avgRating": "0.00", "avgSentiment": "0.50",
        "criticalIssues": 0, "featureRequests": 0,
        "topNegativeKeywords": [], "sentimentTrend": [],
        "topicBreakdown": [], "funnelStats": [], "recommendations": [],
        "lastUpdated": datetime.utcnow().isoformat() + "Z",
    }
