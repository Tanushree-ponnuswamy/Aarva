import os
import secrets
from dotenv import load_dotenv
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.models import (
    Base, User, StudentProfile, StudentInterests, LearningPreferences,
    LoginActivity, LearningProgress, Textbook, QuizResult,
    UserSession, ChatSession, ChatMessage
)
from datetime import datetime, timedelta
from config import settings

# Load .env so DATABASE_URL is always available (backend/.env or root .env)
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")
root_env = Path(__file__).resolve().parent.parent.parent / ".env"
if root_env.exists():
    load_dotenv(dotenv_path=root_env)

# Default to Postgres if env provided, or SQLite for local dev
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aarva.db")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    try:
        # 1. Try standard PostgreSQL driver (psycopg2)
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        with engine.connect() as conn:
            pass
    except Exception:
        try:
            # 2. Try pg8000 pure-python driver
            pg_url = DATABASE_URL.replace("postgresql://", "postgresql+pg8000://", 1)
            engine = create_engine(pg_url, pool_pre_ping=True)
            with engine.connect() as conn:
                pass
        except Exception:
            # 3. Fall back to local SQLite if PostgreSQL service is unavailable
            print("[DATABASE WARNING] PostgreSQL connection unavailable. Falling back to local SQLite (aarva.db).")
            engine = create_engine("sqlite:///./aarva.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    seed_demo_data()

def seed_demo_data():
    db = SessionLocal()
    try:
        import bcrypt
        def _hash_pw(pw: str) -> str:
            pw_bytes = pw[:72].encode("utf-8")
            return bcrypt.hashpw(pw_bytes, bcrypt.gensalt(12)).decode("utf-8")

        def _is_known_default(user, default_pw: str) -> bool:
            """True if this account still uses a password that was published in the repo/docs."""
            try:
                return bool(user.password_hash) and bcrypt.checkpw(
                    default_pw.encode("utf-8"), user.password_hash.encode("utf-8")
                )
            except Exception:
                return False

        # 1. Admin account: only seeded from ADMIN_PASSWORD (env). No default password.
        admin_pw = settings.ADMIN_PASSWORD
        admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if admin and _is_known_default(admin, "admin123"):
            # A previous deployment seeded the publicly-known password: rotate it immediately.
            admin.password_hash = _hash_pw(admin_pw if len(admin_pw) >= 12 else secrets.token_urlsafe(24))
            print("[SECURITY] Rotated the legacy default admin password.")
        if len(admin_pw) >= 12:
            if not admin:
                db.add(User(
                    name="AARVA Administrator", email=settings.ADMIN_EMAIL,
                    password_hash=_hash_pw(admin_pw), role="admin", is_active=True,
                ))
        elif not admin:
            print("[SEED] ADMIN_PASSWORD (>=12 chars) not set: admin account not created.")
        db.flush()

        # Demo student is optional (ENABLE_DEMO_LOGIN). When off, make sure it cannot be used.
        if not settings.ENABLE_DEMO_LOGIN:
            demo = db.query(User).filter(User.email == "student@college.edu").first()
            if demo:
                demo.is_active = False
                if _is_known_default(demo, "student123"):
                    demo.password_hash = _hash_pw(secrets.token_urlsafe(24))
            db.commit()
            return

        # 2. ONLY ONE Sample Student Account: Alex Morgan
        s1 = db.query(User).filter(User.email == "student@college.edu").first()
        if not s1:
            s1 = User(
                name="Alex Morgan",
                email="student@college.edu",
                password_hash=_hash_pw(settings.DEMO_STUDENT_PASSWORD),
                phone="+91 98123 45678",
                dob="2003-05-14",
                gender="Male",
                role="student",
                is_active=True
            )
            db.add(s1)
            db.flush()
        else:
            s1.name = "Alex Morgan"
            s1.is_active = True
            if _is_known_default(s1, "student123"):
                s1.password_hash = _hash_pw(settings.DEMO_STUDENT_PASSWORD)  # retire the published password
            if not s1.password_hash or not s1.password_hash.startswith(("$2a$", "$2b$", "$2y$")):
                s1.password_hash = _hash_pw(settings.DEMO_STUDENT_PASSWORD)
            db.flush()

        if not db.query(StudentProfile).filter(StudentProfile.user_id == s1.id).first():
            db.add(StudentProfile(
                user_id=s1.id,
                learner_type="college",
                institution="Indian Institute of Technology, Madras",
                department="Computer Science & Engineering",
                year="3rd Year",
                semester="Semester 5"
            ))
        if not db.query(StudentInterests).filter(StudentInterests.user_id == s1.id).first():
            db.add(StudentInterests(
                user_id=s1.id,
                subjects=["Data Structures & Algorithms", "Operating Systems", "Artificial Intelligence"],
                goals=["Score 9.0+ CGPA", "Crack Tech Product Company Interviews", "Publish ML Research Paper"],
                personal_interests=["Competitive Programming", "Robotics", "Open Source"]
            ))
        if not db.query(LearningPreferences).filter(LearningPreferences.user_id == s1.id).first():
            db.add(LearningPreferences(
                user_id=s1.id,
                preferred_language="English",
                learning_style=["Short summaries", "Step-by-step solutions", "Diagrams and visual learning"],
                voice_assistance=True,
                text_to_speech=True,
                speech_input=True
            ))
        if not db.query(LearningProgress).filter(LearningProgress.user_id == s1.id).first():
            db.add(LearningProgress(
                user_id=s1.id,
                completed_topics=18,
                quiz_scores_avg=88.5,
                streak_days=12,
                strengths=["Binary Trees", "Dynamic Programming", "Graph Theory"],
                areas_to_improve=["Memory Management", "Concurrency Deadlocks"],
                badges=["Quick Learner", "Algorithm Master", "10-Day Streak", "Quiz Ace"]
            ))

        # Sample Textbook for the single sample student account
        tb1 = db.query(Textbook).filter(Textbook.user_id == s1.id).first()
        if not tb1:
            tb1 = Textbook(
                user_id=s1.id,
                title="Computer Networks: A Systems Approach",
                author="Larry L. Peterson, Bruce S. Davie",
                file_name="computer_networks_peterson.pdf",
                file_size="14.2 MB",
                total_pages=640,
                status="processed",
                summary_data={
                    "complete_summary": "Comprehensive overview of computer networks focusing on the OSI and TCP/IP stack, socket programming, packet switching, flow control, routing algorithms (OSPF, BGP), and transport layer mechanisms like TCP congestion control.",
                    "chapters": [
                        {"chapter": 1, "title": "Foundation & Layered Architecture", "pages": "1-54", "summary": "Covers network edges, packet switching vs circuit switching, delays, and 7-layer OSI model."},
                        {"chapter": 2, "title": "Direct Link Networks & Physical Media", "pages": "55-120", "summary": "Framing, error detection (CRC, Hamming code), reliable transmission protocols like Stop-and-Wait and Sliding Window."},
                        {"chapter": 3, "title": "Packet Switching & Bridging", "pages": "121-190", "summary": "Datagram and virtual circuit models, spanning tree algorithm in Ethernet switches, and cell switching (ATM)."},
                        {"chapter": 4, "title": "Internetworking (IP)", "pages": "191-280", "summary": "IPv4 addressing, subnetting, CIDR, DHCP, NAT, IPv6 transition, and routing algorithms (Dijkstra, Bellman-Ford)."}
                    ],
                    "key_points": [
                        "Packet switching maximizes channel utilization through statistical multiplexing.",
                        "Sliding window protocol guarantees reliable ordered delivery while utilizing link bandwidth efficiently.",
                        "TCP uses AIMD (Additive Increase Multiplicative Decrease) for fair bandwidth distribution.",
                        "DNS provides distributed, hierarchical resolution between human hostnames and numerical IP addresses."
                    ],
                    "definitions": [
                        {"term": "CIDR (Classless Inter-Domain Routing)", "definition": "A method for allocating IP addresses and IP routing that replaces the classful network architecture, reducing routing table bloat."},
                        {"term": "Round Trip Time (RTT)", "definition": "The time it takes for a data packet to travel from a source to a destination and for an acknowledgment to return."},
                        {"term": "Congestion Window (cwnd)", "definition": "A TCP state variable that limits the amount of data a TCP connection can inject into the network without receiving an ACK."}
                    ]
                }
            )
            db.add(tb1)
            db.flush()

        # Clean up any legacy secondary demo users if present to enforce only one sample student account
        legacy_emails = ["priya.patel@school.edu", "rohan.iyer@techcorp.com"]
        for legacy_user in db.query(User).filter(User.email.in_(legacy_emails)).all():
            db.query(Textbook).filter(Textbook.user_id == legacy_user.id).delete(synchronize_session=False)
            db.query(StudentProfile).filter(StudentProfile.user_id == legacy_user.id).delete(synchronize_session=False)
            db.query(StudentInterests).filter(StudentInterests.user_id == legacy_user.id).delete(synchronize_session=False)
            db.query(LearningPreferences).filter(LearningPreferences.user_id == legacy_user.id).delete(synchronize_session=False)
            db.query(LearningProgress).filter(LearningProgress.user_id == legacy_user.id).delete(synchronize_session=False)
            db.query(LoginActivity).filter(LoginActivity.user_id == legacy_user.id).delete(synchronize_session=False)
            db.delete(legacy_user)
        db.flush()

        db.commit()
        print("[DATABASE] Successfully synchronized demo account")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

