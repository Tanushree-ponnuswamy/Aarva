# Database Schema Documentation – AARVA

AARVA utilizes **PostgreSQL** (with local **SQLite** fallback) as its core relational data store. The database schema is managed via **SQLAlchemy ORM** in `backend/models/models.py`.

---

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o| STUDENT_PROFILES : "has profile"
    USERS ||--o| STUDENT_INTERESTS : "has interests"
    USERS ||--o| LEARNING_PREFERENCES : "has preferences"
    USERS ||--o| LEARNING_PROGRESS : "tracks progress"
    USERS ||--o{ LOGIN_ACTIVITY : "records login"
    USERS ||--o{ USER_SESSIONS : "authenticates session"
    USERS ||--o{ TEXTBOOKS : "uploads"
    USERS ||--o{ QUIZ_RESULTS : "completes"
    USERS ||--o{ CHAT_SESSIONS : "initiates"
    
    TEXTBOOKS ||--o{ QUIZ_RESULTS : "evaluates"
    TEXTBOOKS ||--o{ CHAT_SESSIONS : "context for"
    CHAT_SESSIONS ||--o{ CHAT_MESSAGES : "contains"

    USERS {
        int id PK
        string name
        string email UK
        string password_hash
        string phone
        string dob
        string gender
        string role "student | admin"
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    STUDENT_PROFILES {
        int id PK
        int user_id FK
        string learner_type "school | college | professional | independent"
        string institution
        string department
        string year
        string semester
        string board
        string class_grade
        string job_role
        string industry
    }

    STUDENT_INTERESTS {
        int id PK
        int user_id FK
        json subjects
        json goals
        json personal_interests
    }

    LEARNING_PREFERENCES {
        int id PK
        int user_id FK
        string preferred_language
        json learning_style
        boolean voice_assistance
        boolean text_to_speech
        boolean speech_input
        boolean larger_text
        boolean simplified_explanations
    }

    LOGIN_ACTIVITY {
        int id PK
        int user_id FK
        datetime login_timestamp
        datetime logout_timestamp
        string session_status "active | completed"
        string device_info
        string ip_address
    }

    LEARNING_PROGRESS {
        int id PK
        int user_id FK
        int completed_topics
        float quiz_scores_avg
        int streak_days
        int xp
        int level
        json strengths
        json areas_to_improve
        json badges
        datetime updated_at
    }

    TEXTBOOKS {
        int id PK
        int user_id FK
        string title
        string author
        string file_name
        string file_size
        int total_pages
        string status "processed | indexing | pending"
        json summary_data
        datetime uploaded_at
    }

    QUIZ_RESULTS {
        int id PK
        int user_id FK
        int textbook_id FK
        string topic
        int score
        int total_questions
        float percentage
        json details
        datetime completed_at
    }

    USER_SESSIONS {
        int id PK
        int user_id FK
        string token_jti
        string ip_address
        string user_agent
        string device_info
        boolean is_active
        datetime created_at
        datetime last_seen_at
        datetime expires_at
        datetime logged_out_at
    }

    CHAT_SESSIONS {
        int id PK
        int user_id FK
        int textbook_id FK
        string session_title
        boolean is_active
        int message_count
        datetime created_at
        datetime updated_at
    }

    CHAT_MESSAGES {
        int id PK
        int chat_session_id FK
        string role "user | assistant | system"
        string content
        json citations
        int tokens_used
        datetime created_at
    }
```

---

## 2. Table Specifications

### 1. `users`
Core user identity and authentication credentials.
- `id` (Integer, Primary Key, Auto-increment)
- `name` (String(120), Nullable=False)
- `email` (String(255), Unique=True, Index=True, Nullable=False)
- `password_hash` (String(255), Nullable=False) – Bcrypt hashed password
- `phone` (String(30), Nullable=True)
- `dob` (String(20), Nullable=True)
- `gender` (String(20), Nullable=True)
- `role` (String(20), Default='student') – Either `'student'` or `'admin'`
- `is_active` (Boolean, Default=True) – Account suspension flag
- `created_at` (DateTime, Default=UTC now)
- `updated_at` (DateTime, Default=UTC now)

### 2. `student_profiles`
Persona metadata customized for school, college, professional, or independent learners.
- `user_id` (Integer, Foreign Key to `users.id`, Unique=True)
- `learner_type` (String(50)) – `'school'`, `'college'`, `'professional'`, `'independent'`
- `institution`, `department`, `year`, `semester` – For college undergraduates
- `board`, `class_grade` – For school students (e.g. CBSE Class 11)
- `job_role`, `industry` – For working professionals

### 3. `student_interests` & `learning_preferences`
- JSON-encoded arrays of subjects, goals, personal passions.
- Accessibility & UI preferences including preferred language, speech TTS, STT voice input, and larger font settings.

### 4. `learning_progress` & `quiz_results`
- Tracks gamification metrics (XP points, current level, active day streaks).
- Records topic-by-topic strengths and areas needing review.
- Persists full quiz answer submissions with percentage scores.

### 5. `textbooks` & Vector Indexing
- Stores uploaded document references, file sizes, total page counts, and pre-computed hierarchical summaries (complete overview, chapter summaries, key takeaways, glossary terms).

### 6. `user_sessions`, `chat_sessions`, `chat_messages`
- Full tracking of active JWT sessions for security compliance.
- Threaded conversation histories with RAG citations for the Mistral AI tutor.
