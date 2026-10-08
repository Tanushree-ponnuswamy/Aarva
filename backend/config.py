"""
Central Configuration for AARVA & TenderIQ.
Loads all environment variables from .env with typed defaults for:
- RAG Indexing & Querying
- Embedding Semantic Search
- Chunking Parameters
- RRF Method & Hybrid Retrieval
- Cosine Similarity & Distance Metrics
- Top-K Thresholds
- Local Ollama / LLM Generation
- Authentication & Security
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory
BASE_DIR = Path(__file__).resolve().parent

# Load .env file
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)


def _int_env(key: str, default: int) -> int:
    val = os.getenv(key)
    if val is None:
        return default
    try:
        return int(val)
    except (ValueError, TypeError):
        return default

def _float_env(key: str, default: float) -> float:
    val = os.getenv(key)
    if val is None:
        return default
    try:
        return float(val)
    except (ValueError, TypeError):
        return default

class Settings:
    # ── Application ──────────────────────────────────────────
    APP_NAME: str = os.getenv("APP_NAME", "AARVA AI Document & Tender Intelligence")
    APP_ENV: str = os.getenv("APP_ENV", "development")
    APP_HOST: str = os.getenv("APP_HOST", "0.0.0.0")
    APP_PORT: int = _int_env("APP_PORT", 8000)
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("true", "1", "yes")

    # ── Database ─────────────────────────────────────────────
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./aarva.db")

    # ── Authentication & Security ────────────────────────────
    JWT_SECRET: str = os.getenv("JWT_SECRET", os.getenv("JWT_SECRET_KEY", "aarva-tender-jwt-secret-key-prod-2026-secure"))
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = _int_env("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", _int_env("JWT_EXPIRE_MINUTES", 10080))
    BCRYPT_ROUNDS: int = _int_env("BCRYPT_ROUNDS", 12)

    # ── Document Parsing & Upload ────────────────────────────
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_UPLOAD_SIZE_MB: int = _int_env("MAX_UPLOAD_SIZE_MB", 50)
    ALLOWED_FILE_TYPES: list = os.getenv("ALLOWED_FILE_TYPES", "pdf,docx,xlsx,txt").split(",")

    # ── Chunking Engine ──────────────────────────────────────
    CHUNK_SIZE: int = _int_env("CHUNK_SIZE", 600)
    CHUNK_OVERLAP: int = _int_env("CHUNK_OVERLAP", 120)
    MIN_CHUNK_SIZE: int = _int_env("MIN_CHUNK_SIZE", 50)
    CHUNKING_STRATEGY: str = os.getenv("CHUNKING_STRATEGY", "semantic_paragraph")

    # ── Vector Store (ChromaDB) ──────────────────────────────
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", os.getenv("CHROMA_DB_PATH", "./chroma_db"))
    CHROMA_COLLECTION_NAME: str = os.getenv("CHROMA_COLLECTION_NAME", "aarva_knowledge_base")
    CHROMA_DISTANCE_FUNCTION: str = os.getenv("CHROMA_DISTANCE_FUNCTION", "cosine")

    # ── Embedding & Semantic Search ──────────────────────────
    EMBEDDING_PROVIDER: str = os.getenv("EMBEDDING_PROVIDER", "ollama")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", os.getenv("EMBED_MODEL", "bge-large:latest"))
    EMBEDDING_DIMENSION: int = _int_env("EMBEDDING_DIMENSION", _int_env("EMBEDDING_DIM", 1024))
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

    # ── Hybrid Retrieval & RRF Method ────────────────────────
    RETRIEVAL_METHOD: str = os.getenv("RETRIEVAL_METHOD", "hybrid")
    RRF_K: int = _int_env("RRF_K", 60)
    RRF_DENSE_WEIGHT: float = _float_env("RRF_DENSE_WEIGHT", 0.65)
    RRF_SPARSE_WEIGHT: float = _float_env("RRF_SPARSE_WEIGHT", 0.35)
    RETRIEVAL_TOP_K: int = _int_env("RETRIEVAL_TOP_K", _int_env("TOP_K", 4))
    COSINE_SIMILARITY_THRESHOLD: float = _float_env("COSINE_SIMILARITY_THRESHOLD", 0.35)

    # ── RAG Indexing & Querying ──────────────────────────────
    RAG_ENABLED: bool = os.getenv("RAG_ENABLED", "true").lower() in ("true", "1", "yes")
    RAG_CONTEXT_MAX_CHARS: int = _int_env("RAG_CONTEXT_MAX_CHARS", 4000)
    RAG_FALLBACK_ON_ERROR: bool = os.getenv("RAG_FALLBACK_ON_ERROR", "true").lower() in ("true", "1", "yes")

    # ── Single-LLM AI Engine (Qwen3 8B) ──────────────────────
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "ollama")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "qwen3:8b")
    LLM_TEMPERATURE: float = _float_env("LLM_TEMPERATURE", 0.3)
    LLM_MAX_TOKENS: int = _int_env("LLM_MAX_TOKENS", 1024)
    LLM_TIMEOUT_SECONDS: int = _int_env("LLM_TIMEOUT_SECONDS", 45)


    # ── Email / SMTP Configuration ───────────────────────────
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = _int_env("SMTP_PORT", 587)
    SMTP_USER: str = os.getenv("SMTP_USER", os.getenv("EMAIL_USER", "thanushreeponix1977@gmail.com"))
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", os.getenv("EMAIL_PASS", "hokw qfxq dxiz zyof")).replace(" ", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", os.getenv("EMAIL_USER", "thanushreeponix1977@gmail.com"))
    SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME", "Aarva Learning")
    SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "true").lower() in ("true", "1", "yes")

settings = Settings()
