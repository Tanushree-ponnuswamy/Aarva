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
   - **Textbook Library**: Multi-textbook upload with automated text extraction, ChromaDB vector indexing, and Llama summarization.
   - **Dual Learning Screen**:
     - *Textbook Summarizer*: Complete Book, Chapter-wise, Page-wise, and Concept-wise modes, expandable definitions, key takeaways, and Markdown/Print export.
     - *Mistral AI Tutor Chat*: RAG retrieval citing chapter and page numbers, suggested follow-ups, and audio speech output.
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

## 🏗️ Architecture

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
```

---

## 🚀 Running Locally

### 1. Start FastAPI Backend:
```bash
cd backend
python -m uvicorn app:app --port 8000
```
Backend API docs available at: `http://127.0.0.1:8000/docs`

### 2. Start Frontend App:
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
Open `http://localhost:5173` in any browser on desktop, tablet, or phone.
