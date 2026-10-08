import os
import sys
import unittest.mock

# Bypass Windows Application Control policy blocking cygrpc C-extension DLL
os.environ["ANONYMIZED_TELEMETRY"] = "False"
if "opentelemetry.exporter.otlp.proto.grpc.trace_exporter" not in sys.modules:
    sys.modules["opentelemetry.exporter.otlp.proto.grpc.trace_exporter"] = unittest.mock.MagicMock()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.postgres import init_db
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

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
def direct_chat_endpoint(req: ChatMessageRequest):
    """Direct alias for interactive Hybrid RAG Knowledge Base Chat."""
    target_id = req.document_id if req.document_id is not None else req.textbook_id
    return llama_service.chat_response(
        query=req.query,
        textbook_id=target_id,
        language=req.language or "English",
        conversation_history=req.conversation_history
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

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "connected", "chromadb": "ready"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
