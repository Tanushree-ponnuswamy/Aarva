# AARVA – Docker Deployment & Production Guide

This document describes how to build, deploy, and operate the **AARVA AI Adaptive Learning Platform** using Docker and Docker Compose.

---

## 1. Architecture Overview in Docker

The production deployment consists of 3 primary containers connected via an isolated internal bridge network (`aarva-net`):

```
                   ┌──────────────────────────────────────────┐
                   │               User Browser               │
                   └────────────────────┬─────────────────────┘
                                        │
                         HTTP / Port 80 │ Port 5173
                                        ▼
                   ┌──────────────────────────────────────────┐
                   │              aarva-frontend              │
                   │               Nginx Alpine               │
                   │  - Serves compiled React + Vite SPA      │
                   │  - Reverse-proxies /api/ requests        │
                   └────────────────────┬─────────────────────┘
                                        │
                       Internal network │ proxy_pass: http://backend:8000/api/
                                        ▼
                   ┌──────────────────────────────────────────┐
                   │              aarva-backend               │
                   │            FastAPI (Uvicorn)             │
                   │  - Python 3.11 with PyMuPDF & OCR        │
                   │  - Hybrid RAG + ChromaDB vector store    │
                   └──────────┬───────────────────┬───────────┘
                              │                   │
                     SQL      │                   │  LLM & Embeddings API
                     Port 5432│                   │  Port 11434
                              ▼                   ▼
     ┌─────────────────────────────┐         ┌───────────────────────────────┐
     │       aarva-postgres        │         │         Host Machine          │
     │    PostgreSQL 16 Alpine     │         │     Ollama LLM (Qwen3 / BGE)  │
     │    Volume: aarva_pgdata     │         │  http://host.docker.internal  │
     └─────────────────────────────┘         └───────────────────────────────┘
```

---

## 2. Prerequisites

- **Docker Engine**: v20.10+ (Tested on Docker v29.x)
- **Docker Compose**: v2.x+ (Tested on v5.5.x)
- **Ollama**: Installed on the host machine (recommended) or running inside Docker via Compose profile.

---

## 3. Quick Start (1-Minute Launch)

### Step 1: Clone and Configure Environment

```bash
cd Aarva
cp .env.example .env
```

*(Optional)* Review `.env` and set your preferred passwords or SMTP credentials for email verification.

### Step 2: Ensure Ollama is Running on Host

On your host machine, make sure Ollama is running and has the models pulled:

```bash
ollama pull qwen3:8b
ollama pull bge-large:latest
```

> **Note**: If your host Ollama is bound only to `127.0.0.1`, ensure it listens on `0.0.0.0` or allows connections from containers:
> - **Windows / Mac**: Docker Desktop automatically handles `host.docker.internal`.
> - **Linux**: Set `OLLAMA_HOST=0.0.0.0` in your Ollama service configuration.

### Step 3: Build and Start Containers

```bash
docker compose up --build -d
```

### Step 4: Access the Application

- **Web Application**: [http://localhost](http://localhost) (or [http://localhost:5173](http://localhost:5173))
- **FastAPI Interactive Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 4. Default Seed Accounts

When the backend initializes, it seeds the PostgreSQL database with ready-to-test accounts:

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@aarva.edu` | `admin123` | Platform Admin Portal |
| **College Student** | `student@college.edu` | `student123` | Alex Morgan (IIT Madras, CSE) |
| **School Student** | `priya.patel@school.edu` | `student123` | Priya Patel (CBSE Class 11) |
| **Professional** | `rohan.iyer@techcorp.com` | `student123` | Rohan Iyer (Cloud Solutions Architect) |

---

## 5. Persistent Storage & Volumes

Docker preserves your data across container updates using named volumes:

- `aarva_pgdata`: PostgreSQL database records (users, textbooks, quiz records, progress).
- `aarva_uploads`: Uploaded textbooks, documents, and syllabus files.
- `aarva_chroma`: ChromaDB vector embeddings and semantic search indexes.

To inspect active volumes:
```bash
docker volume ls | grep aarva
```

---

## 6. Docker Operations Cheat Sheet

### View Live Logs
```bash
# All services:
docker compose logs -f

# Backend only:
docker compose logs -f backend

# Frontend only:
docker compose logs -f frontend
```

### Check Container Status
```bash
docker compose ps
```

### Stop Services
```bash
docker compose down
```

### Stop Services & Reset All Data (Clean Slate)
```bash
docker compose down -v
```

---

## 7. Running Ollama Inside Docker (Alternative)

If deploying to a VPS where Ollama is not installed on the host OS, run Ollama inside Docker:

```bash
docker compose --profile with-ollama up --build -d
```

Then pull the required models inside the container:
```bash
docker exec -it aarva-ollama ollama pull qwen3:8b
docker exec -it aarva-ollama ollama pull bge-large:latest
```

---

## 8. Production Checklist (VPS / Cloud Deployment)

1. **Set Strong JWT Secrets & DB Passwords**:
   Generate random keys using:
   ```bash
   openssl rand -hex 32
   ```
2. **Reverse Proxy & SSL (HTTPS)**:
   Place Nginx Reverse Proxy with Let's Encrypt (Certbot) or Cloudflare in front of port 80/443.
3. **Firewall (UFW)**:
   Only expose ports `80` (HTTP) and `443` (HTTPS) to the public internet. Keep `5432` and `8000` internal.
