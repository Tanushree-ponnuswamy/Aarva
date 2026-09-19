from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON, Float
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=True)
    dob = Column(String(30), nullable=True)
    gender = Column(String(30), nullable=True)
    role = Column(String(30), default="student") # "student" or "admin"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    interests = relationship("StudentInterests", back_populates="user", uselist=False, cascade="all, delete-orphan")
    preferences = relationship("LearningPreferences", back_populates="user", uselist=False, cascade="all, delete-orphan")
    login_activities = relationship("LoginActivity", back_populates="user", cascade="all, delete-orphan")
    progress = relationship("LearningProgress", back_populates="user", uselist=False, cascade="all, delete-orphan")
    textbooks = relationship("Textbook", back_populates="user", cascade="all, delete-orphan")
    quiz_results = relationship("QuizResult", back_populates="user", cascade="all, delete-orphan")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    learner_type = Column(String(50), nullable=False) # "school", "college", "professional", "independent"
    institution = Column(String(200), nullable=True)
    department = Column(String(100), nullable=True)
    year = Column(String(30), nullable=True)
    semester = Column(String(30), nullable=True)
    board = Column(String(100), nullable=True) # e.g. CBSE, ICSE, State Board
    class_grade = Column(String(50), nullable=True) # e.g. Class 10, Class 12
    job_role = Column(String(100), nullable=True)
    industry = Column(String(100), nullable=True)

    user = relationship("User", back_populates="profile")


class StudentInterests(Base):
    __tablename__ = "student_interests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subjects = Column(JSON, default=list) # List of subjects
    goals = Column(JSON, default=list) # List of goals
    personal_interests = Column(JSON, default=list)

    user = relationship("User", back_populates="interests")


class LearningPreferences(Base):
    __tablename__ = "learning_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    preferred_language = Column(String(50), default="English")
    learning_style = Column(JSON, default=list) # ["Short summaries", "Diagrams", etc.]
    voice_assistance = Column(Boolean, default=False)
    text_to_speech = Column(Boolean, default=False)
    speech_input = Column(Boolean, default=False)
    larger_text = Column(Boolean, default=False)
    simplified_explanations = Column(Boolean, default=False)

    user = relationship("User", back_populates="preferences")


class LoginActivity(Base):
    __tablename__ = "login_activity"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    login_timestamp = Column(DateTime, default=datetime.utcnow)
    logout_timestamp = Column(DateTime, nullable=True)
    session_status = Column(String(30), default="active") # "active", "completed", "expired"
    ip_address = Column(String(50), default="127.0.0.1")
    device_info = Column(String(150), default="Web Browser")

    user = relationship("User", back_populates="login_activities")


class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    completed_topics = Column(Integer, default=0)
    quiz_scores_avg = Column(Float, default=0.0)
    streak_days = Column(Integer, default=1)
    xp = Column(Integer, default=240) # Experience Points
    level = Column(Integer, default=3) # Current Student Level
    level_title = Column(String(100), default="Architecture Scholar")
    next_level_xp = Column(Integer, default=500)
    chapter_milestones = Column(JSON, default=dict) # {"ch_1": "completed", "ch_2": "in_progress", "ch_3": "not_started"}
    concept_mastery = Column(JSON, default=dict) # {"concept_name": "mastered" | "learning" | "needs_review"}
    last_active = Column(DateTime, default=datetime.utcnow)
    strengths = Column(JSON, default=list)
    areas_to_improve = Column(JSON, default=list)
    badges = Column(JSON, default=list)

    user = relationship("User", back_populates="progress")


class Textbook(Base):
    __tablename__ = "textbooks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    author = Column(String(150), default="Unknown")
    file_name = Column(String(255), nullable=False)
    file_size = Column(String(50), default="0 MB")
    total_pages = Column(Integer, default=0)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="processed") # "uploading", "processing", "processed"
    summary_data = Column(JSON, default=dict)

    user = relationship("User", back_populates="textbooks")
    quiz_results = relationship("QuizResult", back_populates="textbook", cascade="all, delete-orphan")


class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    textbook_id = Column(Integer, ForeignKey("textbooks.id", ondelete="SET NULL"), nullable=True)
    topic = Column(String(150), nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    percentage = Column(Float, default=0.0)
    completed_at = Column(DateTime, default=datetime.utcnow)
    details = Column(JSON, default=list)

    user = relationship("User", back_populates="quiz_results")
    textbook = relationship("Textbook", back_populates="quiz_results")
