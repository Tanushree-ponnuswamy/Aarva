# AARVA – AI-Based Adaptive Learning and Textbook Summarization System

**AARVA** is an adaptive, AI-driven learning platform designed for everyone — school students, college students, working professionals, and lifelong learners.

---

## 🌟 Key Features

1. **Universal Multi-Step Adaptive Sign-Up & Authentication**:
   - 4 Dynamic Learner Personas: School Student, College Student, Working Professional, Independent Learner.
   - 4-Step Animated Stepper: Basic Info → Your Profile → Interests & Goals → Preferences.
   - Multilingual support (English, Hindi, Tamil, Telugu, Spanish, French).
   - Voice Assistance (TTS reading aloud + speech recognition STT input).
   - Seamless Dark and Light theme toggle.

2. **Student Portal ("AARVA Learning Space")**:
   - **Textbook Library**: Multi-textbook upload with automated text extraction, ChromaDB vector indexing, and Qwen / Llama AI summarization.
   - **Dual Learning Screen**:
     - *Textbook Summarizer*: Complete Book, Chapter-wise, Page-wise, and Concept-wise modes, expandable definitions, key takeaways, and Markdown/Print export.
     - *AI Tutor Chat (Qwen & Mistral)*: Hybrid RAG retrieval citing chapter and page numbers, suggested follow-ups, and audio speech output.
   - **Adaptive Quiz Module**: Interactive practice questions with instant pedagogical explanations and confetti celebrations.
   - **Progress & Analytics**: Daily streak tracker (🔥 12 Days), concept mastery progress meters, targeted micro-sessions, and achievement badges.
   - **Mobile Experience**: One-handed bottom navigation bar and touch-friendly cards.

3. **Admin Portal ("AARVA User Management")**:
   - Platform Telemetry: Total Students, Active Sessions, Total Textbooks, Average Quiz Scores.
   - Search & Persona Filter.
   - Desktop data table and mobile-friendly card layout.
   - Student Account Status Toggle (Active / Suspended).
   - Student Inspection Modal: Full profile, ChromaDB textbook catalog, and PostgreSQL login activity logs.

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

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | **React 18** + **TypeScript** | Dynamic, type-safe Single Page Application (SPA) |
| **Build Tool & Bundler** | **Vite** | Fast development server and optimized production build |
| **Styling & UI Components** | **CSS Modules** / **Vanilla CSS** + **Lucide Icons** | Responsive layout, theme variables (Light/Dark mode), custom glassmorphism design |
| **Audio & Speech** | **Web Speech API** (TTS & STT) | Voice assistance, speech input queries, and audio reading of tutor responses |
| **Backend Framework** | **FastAPI** (Python 3.10+) | High-throughput asynchronous REST API with automatic Swagger OpenAPI docs |
| **Database & ORM** | **PostgreSQL** / **SQLite** + **SQLAlchemy** | Relational data persistence for users, profiles, progress metrics, quizzes, and audit logs |
| **Vector Database (RAG)** | **ChromaDB** | Semantic embedding storage, similarity search, and chapter/page citation retrieval |
| **AI / LLM Engine** | **Qwen (Qwen3 8B / Qwen2.5)** *(Primary)*, with **Llama 3** & **Mistral AI** fallbacks | Multi-tier summarization, key takeaway generation, adaptive quiz generation, and grounded RAG tutor chat |
| **Authentication & Security** | **JWT (Python-Jose)** + **Bcrypt** | Stateless token auth, active session revocation, secure password hashing, SMTP OTP verification |

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
│   │   │   ├── AIChat.tsx        # AI tutor chat with ChromaDB RAG & voice
│   │   │   ├── QuizModule.tsx    # Timed adaptive quiz with instant feedback
│   │   │   ├── ProgressView.tsx  # Concept mastery & streak analytics
│   │   │   └── AdminPortal.tsx   # User management & session telemetry
│   │   ├── context/
│   │   │   ├── AuthContext.tsx   # Role-based authentication & demo switcher
│   │   │   └── ThemeContext.tsx  # Theme, language, speech synthesis
│   │   └── services/api.ts       # API client connecting to FastAPI
├── backend/                      # FastAPI Python Application
│   ├── app.py                    # Main API server with CORS & startup seeder
│   ├── config.py                 # Pydantic system settings & env loader
│   ├── models/models.py          # SQLAlchemy models (users, profiles, quizzes, etc.)
│   ├── database/
│   │   ├── postgres.py           # Database engine & demo seed data
│   │   └── chroma.py             # ChromaDB vector collection & RAG retrieval
│   ├── routes/                   # auth, admin, students, textbooks, summary, quiz
│   └── services/                 # llama_service (Qwen/Llama/Mistral), quiz_service, adaptive_service
└── docs/                         # Detailed architecture, DB schema & API references
    ├── ARCHITECTURE.md
    ├── DB_SCHEMA.md
    └── API_OVERVIEW.md
```

---

## ⚙️ Setup & Configuration

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd AARVA
   ```
2. **Backend setup**
   ```bash
   cd backend
   python -m venv venv
   . venv/Scripts/activate   # Windows (or source venv/bin/activate on Linux/macOS)
   pip install -r requirements.txt
   ```
   - Create a `.env` file (or set environment variables) with:
     - `DATABASE_URL=postgresql://user:pass@localhost/aarva` (defaults to `sqlite:///./aarva.db` for local dev)
     - `CHROMA_PATH=./vector_db/chroma`
     - `JWT_SECRET=your-secret-key`

3. **Frontend setup**
   ```bash
   cd ../frontend
   npm install
   ```

---

## 🚀 Running Locally

### 1. Start FastAPI Backend:
```bash
cd backend
python -m uvicorn app:app --port 8000 --reload
```
Backend API interactive Swagger docs available at: `http://127.0.0.1:8000/docs`

### 2. Start Frontend App:
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
Open `http://localhost:5173` in any browser on desktop, tablet, or mobile.

---

## 🔑 Demo Accounts

| Role | Email | Password | Persona / Details |
|------|-------|----------|-------------------|
| **College Student** (Auto-fill) | `student@college.edu` | `student123` | Alex Morgan (CSE 3rd Year, IIT Madras) |
| **School Student** | `priya.patel@school.edu` | `student123` | Priya Patel (Class 11 CBSE, DPS RK Puram) |
| **Working Professional** | `rohan.iyer@techcorp.com` | `student123` | Rohan Iyer (Cloud Solutions Architect) |
| **Administrator** | `admin@aarva.edu` | `admin123` | AARVA Platform Administrator |

---

## 📚 Documentation

Detailed system documentation is available in the [`docs/`](file:///d:/Aarva/docs/) folder:
- [Architecture & Flow Diagrams](file:///d:/Aarva/docs/ARCHITECTURE.md)
- [Database Schema & ER Diagrams](file:///d:/Aarva/docs/DB_SCHEMA.md)
- [API Endpoints Reference](file:///d:/Aarva/docs/API_OVERVIEW.md)

---

## 🎥 Project Demo Video

- **Watch the Video Walkthrough on Google Drive**: [AARVA System Demo Video](https://drive.google.com/file/d/1ybVgyU1iQzW7RVQTdciTqkYm3qatSfJi/view?usp=sharing)

