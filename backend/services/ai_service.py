"""
AI Service — Ollama (qwen2.5:3b) integration with full rule-based fallback.
Handles both single review and batch analysis.
"""

from __future__ import annotations
import os
import json
import re
import httpx

# ─── Public API ───────────────────────────────────────────────────────────────

async def call_openrouter(prompt: str, response_format_json: bool = False) -> str:
    """
    Call OpenRouter API with the provided prompt.
    Returns the response content.
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY environment variable is not set")
    
    model = os.getenv("OPENROUTER_MODEL", "deepseek/deepseek-chat")
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "Clarifi AI",
    }
    
    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
    
    if response_format_json:
        payload["response_format"] = {"type": "json_object"}
        
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
        )
        resp.raise_for_status()
        resp_json = resp.json()
        
        choices = resp_json.get("choices", [])
        if not choices:
            raise ValueError(f"OpenRouter returned empty choices: {resp_json}")
            
        content = choices[0].get("message", {}).get("content", "")
        return content


async def analyze_reviews(reviews: list[dict]) -> list[dict]:
    """
    Analyze a list of reviews with OpenRouter.
    Falls back to rule-based analysis if OpenRouter is unavailable.
    Each review dict must have 'text' and optionally 'rating'.
    Returns a list of analysis result dicts in the same order.
    """
    try:
        results = await _openrouter_analyze(reviews)
        # Validate we got the right count back
        if isinstance(results, list) and len(results) == len(reviews):
            return results
        raise ValueError(f"OpenRouter returned {len(results) if isinstance(results, list) else type(results)} results for {len(reviews)} reviews")
    except Exception as e:
        print(f"[AI] OpenRouter failed ({e}), using rule-based fallback.")
        return [_fallback_analyze(r["text"], r.get("rating")) for r in reviews]


# ─── OpenRouter Client ────────────────────────────────────────────────────────

async def _openrouter_analyze(reviews: list[dict]) -> list[dict]:
    prompt = _build_prompt(reviews)
    raw = await call_openrouter(prompt, response_format_json=True)
    parsed = _parse_json_response(raw)
    return parsed


def _build_prompt(reviews: list[dict]) -> str:
    review_lines = "\n".join(
        f'[Review {i+1}]: {r["text"]} (Rating: {r.get("rating", "N/A")})'
        for i, r in enumerate(reviews)
    )
    return f"""Analyze the following customer reviews and return a JSON array.
For each review, provide exactly these fields:
- sentiment: "positive", "negative", or "neutral"
- sentiment_score: float 0.0 (very negative) to 1.0 (very positive)
- keywords: array of up to 5 relevant keywords (strings)
- is_urgent: boolean
- priority: "critical", "high", "medium", or "low"
- summary: one sentence summary of the review
- is_feature_request: boolean
- feature_text: string describing the requested feature, or null

Reviews:
{review_lines}

Respond ONLY with a valid JSON array of {len(reviews)} objects. No explanation, no markdown.
"""


def _parse_json_response(raw: str) -> list[dict]:
    """Extract a JSON array from the model's response, tolerating minor formatting issues."""
    # Try direct parse first
    try:
        result = json.loads(raw)
        if isinstance(result, list):
            return result
        if isinstance(result, dict):
            # Sometimes the model wraps the array: {"results": [...]}
            for v in result.values():
                if isinstance(v, list):
                    return v
    except json.JSONDecodeError:
        pass

    # Try to extract the first JSON array using regex
    match = re.search(r'\[.*\]', raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not parse JSON from model response: {raw[:200]}")


# ─── Rule-Based Fallback ──────────────────────────────────────────────────────

def _fallback_analyze(text: str, rating: float | None = None) -> dict:
    sentiment, score = _analyze_sentiment(text, rating)
    urgency, priority = _detect_urgency(text, sentiment)
    is_feature, feature_text = _extract_feature_request(text)
    return {
        "sentiment":         sentiment,
        "sentiment_score":   score,
        "keywords":          _extract_keywords(text),
        "is_urgent":         urgency,
        "priority":          priority,
        "summary":           _generate_summary(text),
        "is_feature_request": is_feature,
        "feature_text":      feature_text,
    }


_POSITIVE_WORDS = {'great','excellent','amazing','love','perfect','best','awesome','fantastic',
                   'wonderful','good','happy','satisfied','helpful','easy','fast','recommend',
                   'outstanding','brilliant','superb','magnificent'}
_NEGATIVE_WORDS = {'bad','terrible','awful','hate','worst','poor','disappointing','horrible',
                   'useless','broken','slow','crash','error','bug','frustrating','annoying',
                   'dreadful','appalling','atrocious','miserable'}

def _analyze_sentiment(text: str, rating: float | None) -> tuple[str, float]:
    if rating is not None and not isinstance(rating, str):
        try:
            r = float(rating)
            if r >= 4:   return "positive", 0.75 + (r - 4) * 0.125
            if r <= 2:   return "negative", 0.1  + (r - 1) * 0.1
            return "neutral", 0.5
        except (ValueError, TypeError):
            pass

    lower = text.lower()
    pos = sum(1 for w in _POSITIVE_WORDS if w in lower)
    neg = sum(1 for w in _NEGATIVE_WORDS if w in lower)
    if pos > neg:   return "positive", min(0.95, 0.65 + pos * 0.05)
    if neg > pos:   return "negative", max(0.05, 0.35 - neg * 0.04)
    return "neutral", 0.5


_STOP_WORDS = {
    'the','a','an','and','or','but','in','on','at','to','for','of','with','by',
    'is','are','was','were','be','been','being','have','has','had','do','does',
    'did','will','would','could','should','may','might','must','can','shall',
    'i','you','he','she','it','we','they','me','him','her','us','them','my',
    'your','his','their','our','its','this','that','these','those','not','no',
    'so','as','if','then','than','very','just','also','even','still','already',
    'only','more','most','some','any','all','both','such','here','there','when',
    'where','why','how','app','application','product','service','time','way',
    'use','using','used','make','get','go','see','know','think','come','want',
}

def _extract_keywords(text: str) -> list[str]:
    words = re.sub(r'[^\w\s]', ' ', text.lower()).split()
    freq: dict[str, int] = {}
    for w in words:
        if len(w) > 3 and w not in _STOP_WORDS and not w.isdigit():
            freq[w] = freq.get(w, 0) + 1
    return [w for w, _ in sorted(freq.items(), key=lambda x: -x[1])[:5]]


def _generate_summary(text: str) -> str:
    if not text:
        return ""
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
    first = sentences[0] if sentences else text[:150]
    return first[:150] + ("..." if len(first) > 150 else "")


_URGENT_WORDS = {
    'urgent','immediately','asap','critical','emergency','broken','not working',
    'crash','bug','outage','down','unusable','losing','lost','payment',
    'cannot login','cant login','data loss','corrupted','not loading',
}

def _detect_urgency(text: str, sentiment: str) -> tuple[bool, str]:
    lower = text.lower()
    has_urgent = any(w in lower for w in _URGENT_WORDS)
    if has_urgent and sentiment == "negative": return True,  "critical"
    if has_urgent or  sentiment == "negative": return True,  "high"
    if sentiment == "neutral":                 return False, "medium"
    return False, "low"


_FEATURE_KEYWORDS = [
    'would be great','would love','please add','wish','could you add','would like',
    'need a','want a','should have','missing','would be nice','feature request',
    'can you add','hoping for','integrate','integration','add support',
]

def _extract_feature_request(text: str) -> tuple[bool, str | None]:
    lower = text.lower()
    for kw in _FEATURE_KEYWORDS:
        if kw in lower:
            sentences = re.split(r'[.!?]+', text)
            for s in sentences:
                if kw in s.lower():
                    return True, s.strip()[:200]
            return True, text[:200]
    return False, None



