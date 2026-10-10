# Architecture Overview – AARVA System

**AARVA** (AI-Based Adaptive Learning and Textbook Summarization System) is a modular, high-performance platform engineered for personalized education across school students, college undergraduates, working professionals, and lifelong learners.

---

## 1. System Architecture Diagram

```mermaid
flowchart TB
    subgraph Client ["Frontend Client (React 18 + TypeScript + Vite)"]
        UI["Web UI Components & Themes"]
        VoiceSTT["Speech-to-Text (STT) & Audio TTS"]
        LangContext["i18n Multilingual Context"]
        ApiClient["Axios / Fetch API Gateway Client"]
    end

    subgraph BackendGateway ["FastAPI Application Gateway (:8000)"]
        CORSMiddleware["CORS & Request Middleware"]
        AuthRouter["/api/auth (JWT, OTP, Sessions)"]
        StudentRouter["/api/students (Profiles & Stats)"]
        TextbookRouter["/api/textbooks (Upload, Chunker)"]
        SummaryRouter["/api/summary (Llama AI Summarizer)"]
        ChatRouter["/api/chat (Mistral RAG AI Tutor)"]
        QuizRouter["/api/quiz (Adaptive Quiz Evaluator)"]
        AdminRouter["/api/admin (Telemetry & User Mgmt)"]
    end

    subgraph AIServices ["AI Intelligence & Processing Services"]
        PDFProcessor["PDF Extraction & Clean Text Chunker"]
        ChromaService["Chroma Vector Pipeline (Embeddings)"]
        LlamaService["Llama Service (Key Takeaways, Definitions, Chapter Maps)"]
        MistralService["Mistral Tutor (Contextual RAG & Citations)"]
        AdaptiveEngine["Adaptive Engine (Difficulty Calibration & Gamification)"]
    end

    subgraph DataPersistence ["Storage & Persistence Tier"]
        PostgresDB[("PostgreSQL / SQLite Database\n- Users & Credentials\n- Student Profiles & Interests\n- Progress, Streaks & XP\n- Login Activities & User Sessions\n- Quiz Submissions & Scores")]
        ChromaStore[("ChromaDB Vector Store\n- Chunk Text & Embeddings\n- Textbook Metadata & Collections")]
        PDFStorage["Local Filesystem / Blob Store\n- PDF Uploads & Extracted Artifacts"]
    end

    %% Client to Backend
    UI --> ApiClient
    VoiceSTT --> ApiClient
    LangContext --> UI
    ApiClient --> CORSMiddleware
    CORSMiddleware --> AuthRouter
    CORSMiddleware --> StudentRouter
    CORSMiddleware --> TextbookRouter
    CORSMiddleware --> SummaryRouter
    CORSMiddleware --> ChatRouter
    CORSMiddleware --> QuizRouter
    CORSMiddleware --> AdminRouter

    %% Backend to Services
    TextbookRouter --> PDFProcessor
    PDFProcessor --> PDFStorage
    PDFProcessor --> ChromaService
    SummaryRouter --> LlamaService
    ChatRouter --> MistralService
    QuizRouter --> AdaptiveEngine

    %% Services to Data
    ChromaService --> ChromaStore
    LlamaService --> ChromaStore
    MistralService --> ChromaStore
    AuthRouter --> PostgresDB
    AdminRouter --> PostgresDB
    StudentRouter --> PostgresDB
    QuizRouter --> PostgresDB
    TextbookRouter --> PostgresDB
```

---

## 2. Key Architectural Layers

### A. Client Layer (Frontend)
- **Framework**: React 18, TypeScript, Vite.
- **State Management & Contexts**:
  - `AuthContext`: Role-based authentication (Student / Admin), JWT token persistence in `localStorage`, and demo account switcher.
  - `ThemeContext`: Dark/Light theme switching, multilingual localization dictionary (English, Hindi, Tamil, Telugu, Spanish, French), and Web Speech API (TTS & STT).
- **Component Hierarchy**:
  - `UniversalSignup.tsx`: 4-stage adaptive enrollment stepper with persona-tailored fields.
  - `StudentPortal.tsx`: Dual-learning screen coordinator toggling between Summarizer, AI Tutor Chat, Adaptive Quiz, and Progress Analytics.
  - `SummarizerView.tsx`: Multi-tier summarization (Complete book, Chapter-wise, Page-wise, Concept-wise) with export options (Markdown & Print).
  - `AIChat.tsx`: Real-time RAG-powered tutor with chapter/page source citations and voice readout.
  - `QuizModule.tsx`: Timed adaptive quiz with instant pedagogical answer breakdown and streak/XP rewards.
  - `AdminPortal.tsx`: Telemetry dashboard, student inspection modal, and account suspension controls.

### B. Gateway & API Layer (FastAPI Backend)
- **FastAPI**: Asynchronous Python ASGI web server providing OpenAPI (Swagger) documentation and typed Pydantic validation.
- **Security & Session Management**:
  - Passwords hashed using `bcrypt`.
  - Stateless JSON Web Tokens (`HS256`) paired with database-backed `user_sessions` tracking for active session revocation.
  - Email verification codes generated and verified via `services/email_service.py`.

### C. AI Intelligence & Vector Search (RAG)
- **Textbook Ingestion**: `pypdf` / `pdfplumber` extracts structured text from uploaded PDF textbooks.
- **Vector Storage (`ChromaDB`)**: Extracted text chunks are indexed with dense embeddings for high-speed semantic similarity retrieval.
- **Llama Summarization Service**: Generates chapter summaries, key takeaways, and glossary definitions tailored to the learner's persona.
- **Mistral AI Tutor Chat**: Retrieves relevant chunks from ChromaDB based on student questions, injecting textbook context and citing exact chapter and page sources.

---

## 3. End-to-End Workflow Diagrams

### RAG AI Tutor Chat Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student (Web/Mobile)
    participant ChatUI as AIChat Component
    participant API as FastAPI (/api/chat)
    participant Chroma as ChromaDB Vector Store
    participant Mistral as Mistral AI Service

    Student->>ChatUI: Type or Speak question (e.g., "Explain TCP Slow Start")
    ChatUI->>API: POST /api/chat { textbook_id, query, language }
    API->>Chroma: Query top-k relevant textbook chunks
    Chroma-->>API: Return matching chunks with chapter & page metadata
    API->>Mistral: Generate response with retrieved context & student persona
    Mistral-->>API: Stream or return synthesized answer with citations
    API-->>ChatUI: JSON response { answer, citations, suggested_followups }
    ChatUI-->>Student: Render formatted answer + Trigger TTS Voice Readout
```

### Adaptive Quiz Submission & XP Evaluation

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student
    participant QuizUI as QuizModule Component
    participant API as FastAPI (/api/quiz/submit)
    participant DB as PostgreSQL Database

    Student->>QuizUI: Submits completed 5-question adaptive quiz
    QuizUI->>API: POST /api/quiz/submit { textbook_id, answers, score }
    API->>DB: Save QuizResult record
    API->>DB: Update LearningProgress (XP += 50, Streak += 1, Mastery %)
    DB-->>API: Persisted updated stats
    API-->>QuizUI: Return { score, xp_awarded, streak, new_badge_unlocked }
    QuizUI-->>Student: Display confetti animation, score breakdown, review notes
```
