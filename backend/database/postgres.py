import os
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

# Load .env so DATABASE_URL is always available
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

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
        # Helper to get or create demo user
        def get_or_create(email, defaults, profile_creator=None):
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(email=email, **defaults)
                db.add(u)
                db.flush()
                if profile_creator:
                    profile_creator(u)
            else:
                # Ensure active and password reset for demo consistency
                u.is_active = True
                if defaults.get("password_hash"):
                    u.password_hash = defaults["password_hash"]
            return u


        # 1. Admin Account
        admin = User(
            name="AARVA Administrator",
            email="admin@aarva.edu",
            password_hash="admin123", # In production hashed via bcrypt
            phone="+91 98765 43210",
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.flush()

        # Admin login activity
        admin_act = LoginActivity(
            user_id=admin.id,
            login_timestamp=datetime.utcnow() - timedelta(minutes=15),
            session_status="active",
            device_info="Chrome on macOS (Admin Portal)"
        )
        db.add(admin_act)

        # 2. Student 1: College Student (Alex Morgan)
        s1 = User(
            name="Alex Morgan",
            email="student@college.edu",
            password_hash="student123",
            phone="+91 98123 45678",
            dob="2003-05-14",
            gender="Male",
            role="student",
            is_active=True
        )
        db.add(s1)
        db.flush()

        db.add(StudentProfile(
            user_id=s1.id,
            learner_type="college",
            institution="Indian Institute of Technology, Madras",
            department="Computer Science & Engineering",
            year="3rd Year",
            semester="Semester 5"
        ))
        db.add(StudentInterests(
            user_id=s1.id,
            subjects=["Data Structures & Algorithms", "Operating Systems", "Artificial Intelligence"],
            goals=["Score 9.0+ CGPA", "Crack Tech Product Company Interviews", "Publish ML Research Paper"],
            personal_interests=["Competitive Programming", "Robotics", "Open Source"]
        ))
        db.add(LearningPreferences(
            user_id=s1.id,
            preferred_language="English",
            learning_style=["Short summaries", "Step-by-step solutions", "Diagrams and visual learning"],
            voice_assistance=True,
            text_to_speech=True,
            speech_input=True
        ))
        db.add(LoginActivity(
            user_id=s1.id,
            login_timestamp=datetime.utcnow() - timedelta(minutes=45),
            session_status="active",
            device_info="Firefox on Windows 11"
        ))
        db.add(LearningProgress(
            user_id=s1.id,
            completed_topics=18,
            quiz_scores_avg=88.5,
            streak_days=12,
            strengths=["Binary Trees", "Dynamic Programming", "Graph Theory"],
            areas_to_improve=["Memory Management", "Concurrency Deadlocks"],
            badges=["Quick Learner", "Algorithm Master", "10-Day Streak", "Quiz Ace"]
        ))
        
        # Textbooks for s1
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

        db.add(QuizResult(
            user_id=s1.id,
            textbook_id=tb1.id,
            topic="Network Layer & IP Routing",
            score=9,
            total_questions=10,
            percentage=90.0,
            details=[{"q": 1, "correct": True}, {"q": 2, "correct": True}]
        ))

        # 3. Student 2: School Student (Priya Patel)
        s2 = User(
            name="Priya Patel",
            email="priya.patel@school.edu",
            password_hash="student123",
            phone="+91 99887 76655",
            dob="2008-11-20",
            gender="Female",
            role="student",
            is_active=True
        )
        db.add(s2)
        db.flush()

        db.add(StudentProfile(
            user_id=s2.id,
            learner_type="school",
            institution="Delhi Public School, R.K. Puram",
            board="CBSE",
            class_grade="Class 11 Science"
        ))
        db.add(StudentInterests(
            user_id=s2.id,
            subjects=["Physics", "Organic Chemistry", "Mathematics"],
            goals=["Clear JEE Advanced", "Board Exam Top 1%"],
            personal_interests=["Astronomy", "Quiz Club"]
        ))
        db.add(LearningPreferences(
            user_id=s2.id,
            preferred_language="English",
            learning_style=["Diagrams and visual learning", "Practice questions", "Short summaries"],
            simplified_explanations=True
        ))
        db.add(LoginActivity(
            user_id=s2.id,
            login_timestamp=datetime.utcnow() - timedelta(hours=3),
            session_status="active",
            device_info="Safari on iPad Pro"
        ))
        db.add(LearningProgress(
            user_id=s2.id,
            completed_topics=14,
            quiz_scores_avg=84.0,
            streak_days=8,
            strengths=["Electromagnetism", "Stoichiometry"],
            areas_to_improve=["Thermodynamics Integration", "Reaction Mechanisms"],
            badges=["Science Whiz", "Consistent Reader"]
        ))

        # 4. Student 3: Working Professional (Rohan Iyer)
        s3 = User(
            name="Rohan Iyer",
            email="rohan.iyer@techcorp.com",
            password_hash="student123",
            phone="+91 97654 32109",
            role="student",
            is_active=True
        )
        db.add(s3)
        db.flush()

        db.add(StudentProfile(
            user_id=s3.id,
            learner_type="professional",
            job_role="Senior Cloud Solutions Architect",
            industry="Fintech & Cloud Infrastructure"
        ))
        db.add(StudentInterests(
            user_id=s3.id,
            subjects=["Distributed Systems", "Kubernetes", "Generative AI Systems"],
            goals=["AWS Certified Solutions Architect Pro", "Scale LLM Microservices"],
            personal_interests=["Cloud Native", "System Design"]
        ))
        db.add(LearningPreferences(
            user_id=s3.id,
            preferred_language="English",
            learning_style=["Examples and real-world applications", "Short summaries"],
            voice_assistance=True
        ))
        db.add(LoginActivity(
            user_id=s3.id,
            login_timestamp=datetime.utcnow() - timedelta(days=1),
            session_status="completed",
            device_info="Chrome on Android"
        ))
        db.add(LearningProgress(
            user_id=s3.id,
            completed_topics=9,
            quiz_scores_avg=92.0,
            streak_days=5,
            strengths=["Raft Consensus", "Microservices Security"],
            areas_to_improve=["CUDA GPU Optimization"],
            badges=["Cloud Guru"]
        ))

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()
