import os
import sys
import unittest.mock

# Bypass Windows Application Control policy blocking cygrpc C-extension DLL
os.environ["ANONYMIZED_TELEMETRY"] = "False"
if "opentelemetry.exporter.otlp.proto.grpc.trace_exporter" not in sys.modules:
    sys.modules["opentelemetry.exporter.otlp.proto.grpc.trace_exporter"] = unittest.mock.MagicMock()

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from database.postgres import init_db, get_db
from models.models import User
from services.auth_service import get_current_user, get_owned_textbook
from routes.auth import router as auth_router
from routes.admin import router as admin_router
from routes.students import router as student_router
from routes.textbooks import router as textbook_router
from routes.summary import router as summary_router
from routes.quiz import router as quiz_router

app = FastAPI(
    title="AARVA – AI-Based Adaptive Learning and Textbook Summarization System",
    description="Backend API powered by FastAPI, PostgreSQL, ChromaDB, and Llama AI.",
    version="1.0.0"
)

# CORS: explicit allow-list only. No wildcard and no "*.onrender.com" regex
# (anyone can register a free onrender.com subdomain, and credentials are allowed).
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://aarva-1.onrender.com",
    "https://aarva-bkoc.onrender.com",
]
for o in os.getenv("CORS_ORIGINS", "").split(","):
    clean_o = o.strip().rstrip("/")
    if clean_o and clean_o != "*" and clean_o not in allowed_origins:
        allowed_origins.append(clean_o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Range"],
    expose_headers=["Content-Range", "Accept-Ranges", "Content-Length"],
)

@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    return response

# Include Routers
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(student_router)
app.include_router(textbook_router)
app.include_router(summary_router)
app.include_router(quiz_router)

from routes.summary import ChatMessageRequest
from services.llama_service import llama_service

@app.post("/api/chat", tags=["Textbook Summarization & AI Chat"])
def direct_chat_endpoint(
    req: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Direct alias for interactive Hybrid RAG Knowledge Base Chat (authenticated, owner-only)."""
    target_id = req.document_id if req.document_id is not None else req.textbook_id
    if target_id is not None:
        get_owned_textbook(db, target_id, current_user)
    return llama_service.chat_response(
        query=req.query,
        textbook_id=target_id,
        language=req.language or "English",
        conversation_history=(req.conversation_history or [])[-20:]
    )

@app.on_event("startup")
def on_startup():
    print("[STARTUP] Initializing AARVA Database and Seeding Demo Data...")
    init_db()
    print("[OK] AARVA Database Initialized with Admin and Student seed records.")

@app.get("/")
def root():
    return {
        "system": "AARVA",
        "tagline": "AI-Based Adaptive Learning and Textbook Summarization System",
        "status": "operational",
        "portals": {
            "student_portal": "AARVA Learning Space",
            "admin_portal": "AARVA User Management"
        }
    }

@app.get("/api/health/email")
def email_health():
    """Which mail path is configured and why the last send failed (no secrets)."""
    from services.email_service import email_service
    from config import settings
    return {
        "brevo_api_key_set": bool(os.getenv("BREVO_API_KEY", "").strip()),
        "smtp_host": settings.SMTP_HOST,
        "smtp_port": settings.SMTP_PORT,
        "smtp_user_set": bool(settings.SMTP_USER),
        "smtp_password_set": bool(settings.SMTP_PASSWORD),
        "from_email_set": bool(settings.SMTP_FROM_EMAIL),
        "signup_without_verification_allowed": settings.ALLOW_SIGNUP_WITHOUT_EMAIL_VERIFICATION,
        "last_error": email_service.last_error,
    }


@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    """Real liveness check: actually touches the database."""
    try:
        db.execute(text("SELECT 1"))
        from database import postgres as _pg
        raw_url = os.getenv("DATABASE_URL", "")
        info = {"status": "healthy", "database": "connected", "engine": _pg.engine.dialect.name,
                "database_url_set": bool(raw_url), "database_target": _pg.DB_TARGET, "database_url_scheme": raw_url.split("://")[0] if "://" in raw_url else None}
        if _pg.DB_FALLBACK_REASON:
            info["fallback_reason"] = _pg.DB_FALLBACK_REASON
        return info
    except Exception:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=503, content={"status": "unhealthy", "database": "unreachable"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)
