# ==============================================================================
#  AARVA Backend - Dockerfile
#  Python 3.11 Slim with Fast API, ChromaDB, PyMuPDF, OCR & PostgreSQL driver
# ==============================================================================

FROM python:3.11-slim-bookworm

# Avoid Python bytecode and buffering for instant log delivery in containers
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    ANONYMIZED_TELEMETRY=False

# Install system dependencies:
# - build-essential & libpq-dev: native compilation support for wheels
# - tesseract-ocr & tesseract-ocr-eng: image OCR processing fallback
# - curl: container healthcheck probe
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    tesseract-ocr \
    tesseract-ocr-eng \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency specification first for optimal Docker layer caching
COPY requirements.txt .

# Upgrade pip and install Python packages
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application source code
COPY . .

# Ensure storage directories for uploads and vector embeddings exist
RUN mkdir -p /app/uploads /app/vector_db /app/chroma_db

# Expose API port
EXPOSE 8000

# Healthcheck probe using the API health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Start Uvicorn ASGI server
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
