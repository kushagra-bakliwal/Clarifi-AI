"""
Clarifi AI - FastAPI Backend
Replaces Supabase Edge Functions for local development.
Integrates directly with Ollama (qwen2.5:3b) and Supabase PostgreSQL.
"""

import os
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from routers import reviews, kpis, chat, feature_requests, recommendations

# Load env file from the backend folder specifically
backend_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(backend_dir, ".env")
load_dotenv(dotenv_path)


app = FastAPI(
    title="Clarifi AI API",
    description="Customer Feedback Intelligence Platform — FastAPI Backend",
    version="2.0.0",
)

# ─── CORS ────────────────────────────────────────────────────────────────────
# Allow the Vite dev server (and any other origin) to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(reviews.router,          prefix="/reviews",          tags=["Reviews"])
app.include_router(kpis.router,             prefix="/kpis",             tags=["KPIs"])
app.include_router(chat.router,             prefix="/chat",             tags=["Chat"])
app.include_router(feature_requests.router, prefix="/feature-requests", tags=["Feature Requests"])
app.include_router(recommendations.router,  prefix="/recommendations",  tags=["Recommendations"])


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "clarifi-ai-api"}


# ─── Global Exception Handler ─────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)},
    )
