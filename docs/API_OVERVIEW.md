# API Documentation – AARVA Backend

The AARVA backend provides a RESTful API built on **FastAPI**. All JSON responses follow consistent schemas and endpoints are protected via **JWT Bearer Authentication** (except public auth & OTP flows).

Interactive Swagger UI is accessible at: `http://127.0.0.1:8000/docs`

---

## 1. Authentication & Session Endpoints (`/api/auth`)

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| `POST` | `/api/auth/send-otp` | Generate and send 4-digit email verification OTP | No |
| `POST` | `/api/auth/verify-otp` | Validate submitted OTP code | No |
| `POST` | `/api/auth/signup` | Register a new student and issue JWT token | No |
| `POST` | `/api/auth/login` | Student login with email & password | No |
| `GET` | `/api/auth/me` | Fetch authenticated user's profile & progress | Yes (Bearer) |
| `POST` | `/api/auth/logout` | Invalidate active session | Yes (Bearer) |
| `GET` | `/api/auth/sessions` | List active device sessions for current user | Yes (Bearer) |
| `GET` | `/api/auth/chat-sessions` | List student chat sessions | Yes (Bearer) |

---

## 2. Admin Portal Endpoints (`/api/admin`)

| Method | Path | Description | Role Required |
|--------|------|-------------|---------------|
| `POST` | `/api/admin/login` | Admin portal authentication | No |
| `GET` | `/api/admin/metrics` | System telemetry (total students, active sessions, textbooks, avg quiz score) | Admin |
| `GET` | `/api/admin/students` | Paginated and filtered student roster | Admin |
| `GET` | `/api/admin/students/{id}` | Detailed inspection of student profile, textbooks, and login audit | Admin |
| `POST` | `/api/admin/students/{id}/toggle-status` | Toggle student account status (Active / Suspended) | Admin |

---

## 3. Textbook Ingestion & Summarization (`/api/textbooks`, `/api/summary`)

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| `POST` | `/api/textbooks/upload` | Upload PDF textbook, extract text, chunk and index in ChromaDB | Yes |
| `GET` | `/api/textbooks/list` | List textbooks belonging to the user | Yes |
| `GET` | `/api/textbooks/{id}` | Get metadata and parsed chapters for a textbook | Yes |
| `POST` | `/api/summary/generate` | Generate complete, chapter, page, or concept summary via Llama AI | Yes |
| `POST` | `/api/summary/chat` | RAG context query with textbook citation retrieval | Yes |
| `POST` | `/api/chat` | Direct alias for Hybrid RAG AI Tutor Chat | Yes |

---

## 4. Adaptive Quiz Engine (`/api/quiz`)

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| `GET` | `/api/quiz/{textbook_id}` | Generate/retrieve dynamic questions calibrated to learner mastery | Yes |
| `POST` | `/api/quiz/submit` | Submit answers, calculate score, award XP points, and update streak | Yes |
| `GET` | `/api/quiz/history` | Retrieve historical quiz attempts and performance analytics | Yes |

---

## 5. Sample Request & Response Payloads

### Login Request (`POST /api/auth/login`)
```json
{
  "email": "student@college.edu",
  "password": "student123",
  "portal": "student"
}
```

### Login Response (`200 OK`)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1Ni...",
  "access_token": "eyJhbGciOiJIUzI1Ni...",
  "token_type": "bearer",
  "user": {
    "id": 7,
    "name": "Alex Morgan",
    "email": "student@college.edu",
    "role": "student",
    "learner_type": "college"
  }
}
```
