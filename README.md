# AARVA – AI-Based Adaptive Learning & Textbook Summarization System

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![ChromaDB](https://img.shields.io/badge/Vector%20Store-ChromaDB-FF6B6B.svg)](https://www.trychroma.com)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20SQLite-4169E1.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![AI Models](https://img.shields.io/badge/AI%20Engine-Llama%20%26%20Mistral-FF9900.svg)](https://ai.meta.com/llama/)

**AARVA** is an enterprise-grade, adaptive, AI-driven learning intelligence and textbook summarization platform designed to eliminate cognitive overload for school students, college undergraduates, working professionals, and lifelong learners.

---

## 🎥 Project Demo & Video Walkthrough

- **Google Drive Video Demo**: [Watch AARVA Demo Walkthrough](https://drive.google.com/file/d/1ybVgyU1iQzW7RVQTdciTqkYm3qatSfJi/view?usp=sharing)

---

## 💡 About AARVA

### The Problem
Traditional academic textbooks and professional reference manuals often span hundreds of dense pages. Learners struggle with:
1. **Information Overload**: Difficulty distilling actionable takeaways and core formulas from voluminous materials.
2. **Unverified AI Hallucinations**: Generic public chatbots hallucinate concepts and lack grounded page-by-page references.
3. **One-Size-Fits-All Teaching**: Standard courses fail to adapt to varying learner baselines—a high school student needs simplified visual analogies, while a software engineer needs architectural depth.
4. **Fragmented Study Tools**: Disconnected notes, flashcards, quiz apps, and document readers reduce learning retention.

### The AARVA Solution
**AARVA** bridges these gaps by transforming static PDF textbooks into an interactive, multi-modal, adaptive learning ecosystem:
- **Hierarchical Summarization**: Instant multi-tier breakdown (Entire Book → Chapter → Page → Core Concepts & Glossary).
- **Grounded Hybrid RAG Tutor**: An intelligent Mistral-powered AI tutor that provides answers strictly backed by uploaded textbook citations (Chapter & Page references).
- **Persona-Calibrated Explanations**: Dynamically tailors vocabulary, complexity, and examples based on the student's selected persona.
- **Adaptive Quizzing & Gamification**: Calibrated practice questions that reward XP, maintain active day streaks, and offer detailed pedagogical explanations for mistakes.
- **Multilingual Voice Accessibility**: Integrated Speech-to-Text (STT) query input, Text-to-Speech (TTS) readout, and 6-language UI localization (English, Hindi, Tamil, Telugu, Spanish, French).

---

## 🎓 Tailored Learner Personas

| Persona | Target Audience | Tailored Experience |
|---|---|---|
| 🏫 **School Student** | CBSE / ICSE / State Board (Classes 6–12) | Simplified explanations, visual diagrams, foundational glossaries, practice quiz drills. |
| 🎓 **College Student** | Undergraduates & Postgraduates (Engineering, Science, Arts) | Comprehensive chapter maps, exam-oriented takeaways, research paper links, algorithm breakdowns. |
| 💼 **Working Professional** | Engineers, Managers, Upskilling Specialists | Rapid executive summaries, real-world case studies, architecture diagrams, interview cheat-sheets. |
| 🌐 **Independent Learner** | Lifelong learners, Hobbyists, Researchers | Self-paced topic exploration, deep concept drill-downs, cross-disciplinary synthesis. |

---

## 🌟 Core System Features

### 1. Universal Multi-Step Adaptive Onboarding & Auth
- **4-Step Animated Enrollment**: Basic Credentials → Persona Details → Academic Interests & Goals → Accessibility & UI Preferences.
- **Email Verification (SMTP OTP)**: 4-digit security code dispatched with live preview for instant testing.
- **Security & Session Controls**: Bcrypt password hashing, signed JWT authentication (`HS256`), and active session revocation.

### 2. Student Portal ("AARVA Learning Space")
- **Textbook Ingestion & Vector Indexing**: Upload any standard PDF; AARVA automatically parses text, chunks content, and builds semantic embeddings in ChromaDB.
- **Multi-Mode Summarizer**:
  - *Full Overview*: Executive summary and high-level synopsis.
  - *Chapter Maps*: Breakdown by chapters with page spans.
  - *Key Takeaways*: Bulleted core insights for rapid revision.
  - *Glossary & Definitions*: Interactive expandable term cards.
  - *Export Capabilities*: One-click Markdown (.md) and formatted PDF/Print export.
- **Mistral AI Tutor (RAG Chat)**:
  - Answers contextually grounded in textbook vector embeddings.
  - Cites exact Chapter and Page numbers for every factual claim.
  - Smart follow-up question chips to guide deeper understanding.
  - Audio speech synthesis button to listen to any response.
- **Adaptive Quiz Module**:
  - Timed practice questions generated from indexed textbook chapters.
  - Immediate corrective feedback explaining *why* an answer is correct or incorrect.
  - Confetti celebrations upon high scores with XP points and achievement badge unlocks.
- **Analytics & Streak Tracker**:
  - 🔥 Daily active streak counter with motivational rewards.
  - Topic-by-topic mastery gauges and diagnostic feedback (Strengths & Areas to Improve).
  - One-handed bottom navigation bar optimized for mobile and tablet touchscreens.

### 3. Admin Portal ("AARVA User Management")
- **Real-time Platform Telemetry**: Total Registered Students, Active Login Sessions, Total Indexed Textbooks, Platform Average Quiz Scores.
- **Student Roster Management**: Search by name/email, filter by persona (School, College, Professional), and view account creation timestamps.
- **Account Controls**: Instant Active/Suspended toggle for administrative compliance.
- **Deep Inspection Modal**: View full student profile, enrolled subjects, career goals, uploaded textbook libraries, and PostgreSQL login audit logs.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (Responsive React + Vite SPA)"]
        UI["Modern Web Interface"]
        AuthModal["Multi-Step Adaptive Signup / Login"]
        TutorChat["Mistral AI Tutor & Voice Assistant"]
        Summarizer["Multi-Mode Textbook Summarizer"]
        AdaptiveQuiz["Gamified Adaptive Quiz Engine"]
        AdminDashboard["Admin Telemetry & User Manager"]
    end

    subgraph APILayer ["API & Gateway Layer (FastAPI)"]
        AuthRoute["/api/auth (JWT & OTP Auth)"]
        AdminRoute["/api/admin (Metrics & User Mgmt)"]
        TextbookRoute["/api/textbooks (Upload & Indexing)"]
        SummaryRoute["/api/summary (Llama AI Summaries)"]
        QuizRoute["/api/quiz (Adaptive Evaluation)"]
        StudentsRoute["/api/students (Profiles & Stats)"]
    end

    subgraph ServiceLayer ["AI & Business Services"]
        LlamaService["Llama Service (Summarization & Concept Extraction)"]
        MistralService["Mistral Service (RAG Tutor Chat)"]
        AdaptiveEngine["Adaptive Engine (Personalized Learning Paths)"]
        EmailService["SMTP Email Service (Verification OTPs)"]
    end

    subgraph StorageLayer ["Data & Vector Persistence"]
        PostgresDB[("PostgreSQL / SQLite Database\n- Users & Student Profiles\n- Learning Progress & Streaks\n- Quiz History & Analytics\n- User & Chat Sessions")]
        ChromaVectorDB[("ChromaDB Vector Store\n- PDF Embeddings (Chunks)\n- Semantic Search Collection\n- Chapter/Page Metadata")]
    end

    UI --> AuthRoute
    AuthModal --> AuthRoute
    TutorChat --> SummaryRoute
    Summarizer --> TextbookRoute
    Summarizer --> SummaryRoute
    AdaptiveQuiz --> QuizRoute
    AdminDashboard --> AdminRoute

    AuthRoute --> EmailService
    AuthRoute --> PostgresDB
    AdminRoute --> PostgresDB
    StudentsRoute --> PostgresDB
    QuizRoute --> AdaptiveEngine
    QuizRoute --> PostgresDB
    TextbookRoute --> ChromaVectorDB
    TextbookRoute --> PostgresDB
    SummaryRoute --> LlamaService
    SummaryRoute --> MistralService
    LlamaService --> ChromaVectorDB
    MistralService --> ChromaVectorDB
```

---

## 🔄 End-to-End RAG Ingestion & Query Flow

```mermaid
sequenceDiagram
    autonumber
    actor Learner as Student / Professional
    participant UI as AARVA Web App
    participant Gateway as FastAPI Gateway
    participant VectorDB as ChromaDB Vector Store
    participant LLM as Llama / Mistral AI Service
    participant RelationalDB as PostgreSQL Database

    rect rgb(240, 248, 255)
        Note over Learner,VectorDB: Step 1: Textbook Upload & Ingestion
        Learner->>UI: Uploads Textbook PDF
        UI->>Gateway: POST /api/textbooks/upload (multipart/form-data)
        Gateway->>Gateway: Extract text & chunk into semantic blocks (500 tokens)
        Gateway->>VectorDB: Generate & insert embeddings with chapter/page metadata
        Gateway->>RelationalDB: Save Textbook record (title, author, total pages)
        Gateway-->>UI: 200 OK (Indexed & ready for learning)
    end

    rect rgb(254, 249, 231)
        Note over Learner,LLM: Step 2: Adaptive RAG Chat & Summarization
        Learner->>UI: Asks Question / Requests Chapter Summary
        UI->>Gateway: POST /api/chat { textbook_id, query, language }
        Gateway->>VectorDB: Query top-k semantic matches
        VectorDB-->>Gateway: Return relevant textbook chunks + page numbers
        Gateway->>LLM: Synthesize prompt with chunks + student persona
        LLM-->>Gateway: Return response with citations
        Gateway-->>UI: JSON { answer, citations: ["Ch. 4, Pg. 215"], suggested_followups }
        UI-->>Learner: Render formatted answer + Speech Audio playback
    end
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used | Purpose |
|---|---|---|
| **Frontend UI/UX** | React 18, TypeScript, Vite, CSS Modules, Lucide Icons | Responsive SPA, dark/light theme, accessible components |
| **Speech & Audio** | Web Speech API (SpeechSynthesis & SpeechRecognition) | Multilingual voice assistance and audio readout |
| **Backend API** | Python 3.10+, FastAPI, Pydantic, Uvicorn | High-throughput async REST endpoints and automatic Swagger OpenAPI |
| **Relational Storage** | PostgreSQL / SQLite, SQLAlchemy ORM | User accounts, personas, quiz history, progress, and audit logs |
| **Vector Database** | ChromaDB, Sentence-Transformers | Dense vector indexing, similarity search, and RAG retrieval |
| **AI / LLM Integration** | Meta Llama, Mistral AI | Multi-mode summarization, key takeaway generation, and conversational tutoring |
| **Authentication** | Python-Jose (JWT), Passlib / Bcrypt | Stateless token authentication, session revocation, secure password hashing |

---

## 📁 Repository Structure

```
d:\Aarva\
├── frontend/                     # Modern React / TypeScript / Vite Web App
│   ├── src/
│   │   ├── components/
│   │   │   ├── AarvaLogo.tsx     # Custom AARVA gradient SVG brand logo
│   │   │   ├── Navbar.tsx        # Topbar with Voice, Lang, Theme, Demo switcher
│   │   │   ├── BottomNav.tsx     # One-handed mobile bottom navigation
│   │   │   ├── UniversalSignup.tsx # Mockup-faithful dynamic 4-step signup
│   │   │   ├── StudentPortal.tsx # Dual learning space coordinator
│   │   │   ├── SummarizerView.tsx # Multi-mode summarizer & export
│   │   │   ├── AIChat.tsx        # Mistral AI tutor with ChromaDB RAG & voice
│   │   │   ├── QuizModule.tsx    # Timed adaptive quiz with instant feedback
│   │   │   ├── ProgressView.tsx  # Concept mastery & streak analytics
│   │   │   └── AdminPortal.tsx   # User management & session telemetry
│   │   ├── context/
│   │   │   ├── AuthContext.tsx   # Role-based authentication & demo switcher
│   │   │   └── ThemeContext.tsx  # Theme, language, speech synthesis
│   │   └── services/api.ts       # API client connecting to FastAPI
├── backend/                      # FastAPI Python Application
│   ├── app.py                    # Main API server with CORS & startup seeder
│   ├── models/models.py          # SQLAlchemy models (users, profiles, quizzes, etc.)
│   ├── database/
│   │   ├── postgres.py           # Database engine & demo seed data
│   │   └── chroma.py             # ChromaDB vector collection & RAG retrieval
│   ├── routes/                   # auth, admin, students, textbooks, summary, quiz
│   └── services/                 # llama_service, mistral_service, adaptive_service
└── docs/                         # Detailed architecture, DB schema & API references
    ├── ARCHITECTURE.md
    ├── DB_SCHEMA.md
    └── API_OVERVIEW.md
```

---

## ⚙️ Setup & Configuration

### Prerequisites
- **Node.js** (v18+) and **npm**
- **Python** (3.10+) and `pip`

### 1. Clone the repository
```bash
git clone https://github.com/Tanushree-ponnuswamy/Aarva.git
cd Aarva
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
. venv/Scripts/activate   # On Windows (or source venv/bin/activate on Linux/macOS)
pip install -r requirements.txt
```

Environment Configuration (create `backend/.env`):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/aarva # Fallback: sqlite:///./aarva.db
CHROMA_PATH=./vector_db/chroma
JWT_SECRET=aarva-tender-jwt-secret-key-prod-2026-secure
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

---

## 🚀 Running Locally

### 1. Start FastAPI Backend Server:
```bash
cd backend
python -m uvicorn app:app --port 8000 --reload
```
Interactive Swagger API documentation available at: `http://127.0.0.1:8000/docs`

### 2. Start Frontend Development Server:
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
Open `http://localhost:5173` in any browser on desktop, tablet, or mobile.

---

## 🔑 Pre-Seeded Demo Accounts

| Portal | Email | Password | Persona / Background |
|---|---|---|---|
| **Student (Auto-Fill)** | `student@college.edu` | `student123` | Alex Morgan (CSE 3rd Year, IIT Madras) |
| **Student** | `priya.patel@school.edu` | `student123` | Priya Patel (Class 11 Science CBSE, DPS RK Puram) |
| **Student** | `rohan.iyer@techcorp.com` | `student123` | Rohan Iyer (Senior Cloud Solutions Architect) |
| **Administrator** | `admin@aarva.edu` | `admin123` | AARVA Platform Administrator |

---

## 📚 Complete Documentation

Detailed technical architecture and database specifications are maintained in the [`docs/`](file:///d:/Aarva/docs/) directory:
- 🏛️ [System Architecture & Flow Diagrams](file:///d:/Aarva/docs/ARCHITECTURE.md)
- 🗄️ [Database Schema & ER Diagrams](file:///d:/Aarva/docs/DB_SCHEMA.md)
- 🔌 [API Endpoints Reference](file:///d:/Aarva/docs/API_OVERVIEW.md)
