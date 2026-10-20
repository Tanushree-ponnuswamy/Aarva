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
        # 1. Admin Account
        admin = db.query(User).filter(User.email == "admin@aarva.edu").first()
        if not admin:
            admin = User(
                name="AARVA Administrator",
                email="admin@aarva.edu",
                password_hash="admin123",
                phone="+91 98765 43210",
                role="admin",
                is_active=True
            )
            db.add(admin)
            db.flush()
        else:
            admin.is_active = True
            admin.password_hash = "admin123"
            db.flush()

        # 2. Student 1: College Student (Alex Morgan)
        s1 = db.query(User).filter(User.email == "student@college.edu").first()
        if not s1:
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
        else:
            s1.name = "Alex Morgan"
            s1.password_hash = "student123"
            s1.is_active = True
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

        # Distinct Textbook for Alex Morgan (College)
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

        # 3. Student 2: School Student (Priya Patel)
        s2 = db.query(User).filter(User.email == "priya.patel@school.edu").first()
        if not s2:
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
        else:
            s2.name = "Priya Patel"
            s2.password_hash = "student123"
            s2.is_active = True
            db.flush()

        if not db.query(StudentProfile).filter(StudentProfile.user_id == s2.id).first():
            db.add(StudentProfile(
                user_id=s2.id,
                learner_type="school",
                institution="Delhi Public School, R.K. Puram",
                board="CBSE",
                class_grade="Class 11 Science"
            ))
        if not db.query(StudentInterests).filter(StudentInterests.user_id == s2.id).first():
            db.add(StudentInterests(
                user_id=s2.id,
                subjects=["Physics", "Organic Chemistry", "Mathematics"],
                goals=["Clear JEE Advanced", "Board Exam Top 1%"],
                personal_interests=["Astronomy", "Quiz Club"]
            ))
        if not db.query(LearningPreferences).filter(LearningPreferences.user_id == s2.id).first():
            db.add(LearningPreferences(
                user_id=s2.id,
                preferred_language="English",
                learning_style=["Diagrams and visual learning", "Practice questions", "Short summaries"],
                simplified_explanations=True
            ))
        if not db.query(LearningProgress).filter(LearningProgress.user_id == s2.id).first():
            db.add(LearningProgress(
                user_id=s2.id,
                completed_topics=14,
                quiz_scores_avg=84.0,
                streak_days=8,
                strengths=["Electromagnetism", "Stoichiometry"],
                areas_to_improve=["Thermodynamics Integration", "Reaction Mechanisms"],
                badges=["Science Whiz", "Consistent Reader"]
            ))

        # Distinct Textbook for Priya Patel (School)
        tb2 = db.query(Textbook).filter(Textbook.user_id == s2.id).first()
        if not tb2:
            tb2 = Textbook(
                user_id=s2.id,
                title="NCERT Physics Class 11: Mechanics & Laws of Motion",
                author="National Council of Educational Research and Training",
                file_name="ncert_physics_class11.pdf",
                file_size="9.8 MB",
                total_pages=312,
                status="processed",
                summary_data={
                    "complete_summary": "Comprehensive Class 11 Physics guide covering Newton's Laws of Motion, Friction, Work, Energy, Power, Rotational Dynamics, Gravitation, and Harmonic Motion with conceptual diagrams and step-by-step numerical examples.",
                    "chapters": [
                        {"chapter": 1, "title": "Units and Measurements", "pages": "1-35", "summary": "SI units, dimensional analysis, significant figures, and error propagation in physical measurements."},
                        {"chapter": 2, "title": "Motion in a Straight Line", "pages": "36-72", "summary": "Position, velocity, uniform acceleration, kinematics equations, and graphical analysis of motion."},
                        {"chapter": 3, "title": "Laws of Motion & Friction", "pages": "73-125", "summary": "Newton's three laws, inertia, momentum conservation, static vs kinetic friction, and circular dynamics."},
                        {"chapter": 4, "title": "Work, Energy and Power", "pages": "126-180", "summary": "Work-energy theorem, conservative forces, potential energy of springs, and collisions in 1D & 2D."}
                    ],
                    "key_points": [
                        "Newton's First Law introduces inertia as the tendency to resist changes in motion state.",
                        "Impulse is equal to change in linear momentum: J = F · dt = dp.",
                        "Total mechanical energy is strictly conserved in isolated systems with conservative forces."
                    ],
                    "definitions": [
                        {"term": "Inertia", "definition": "The inherent property of a body by virtue of which it opposes any change in its state of rest or uniform motion along a straight line."},
                        {"term": "Work-Energy Theorem", "definition": "The net work done on an object equals the change in its kinetic energy: W_net = Delta K."}
                    ]
                }
            )
            db.add(tb2)
            db.flush()

        # 4. Student 3: Working Professional (Rohan Iyer)
        s3 = db.query(User).filter(User.email == "rohan.iyer@techcorp.com").first()
        if not s3:
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
        else:
            s3.name = "Rohan Iyer"
            s3.password_hash = "student123"
            s3.is_active = True
            db.flush()

        if not db.query(StudentProfile).filter(StudentProfile.user_id == s3.id).first():
            db.add(StudentProfile(
                user_id=s3.id,
                learner_type="professional",
                institution="TechCorp Cloud Solutions",
                department="Cloud Infrastructure & AI",
                job_role="Senior Cloud Solutions Architect",
                industry="Fintech & Cloud Infrastructure"
            ))
        if not db.query(StudentInterests).filter(StudentInterests.user_id == s3.id).first():
            db.add(StudentInterests(
                user_id=s3.id,
                subjects=["Distributed Systems", "Kubernetes", "Generative AI Systems"],
                goals=["AWS Certified Solutions Architect Pro", "Scale LLM Microservices"],
                personal_interests=["Cloud Native", "System Design"]
            ))
        if not db.query(LearningPreferences).filter(LearningPreferences.user_id == s3.id).first():
            db.add(LearningPreferences(
                user_id=s3.id,
                preferred_language="English",
                learning_style=["Examples and real-world applications", "Short summaries"],
                voice_assistance=True
            ))
        if not db.query(LearningProgress).filter(LearningProgress.user_id == s3.id).first():
            db.add(LearningProgress(
                user_id=s3.id,
                completed_topics=9,
                quiz_scores_avg=92.0,
                streak_days=5,
                strengths=["Raft Consensus", "Microservices Security"],
                areas_to_improve=["CUDA GPU Optimization"],
                badges=["Cloud Guru"]
            ))

        # Distinct Textbook for Rohan Iyer (Professional)
        tb3 = db.query(Textbook).filter(Textbook.user_id == s3.id).first()
        if not tb3:
            tb3 = Textbook(
                user_id=s3.id,
                title="Designing Distributed Systems & Cloud Microservices",
                author="Brendan Burns & Martin Kleppmann",
                file_name="distributed_systems_architecture.pdf",
                file_size="18.5 MB",
                total_pages=498,
                status="processed",
                summary_data={
                    "complete_summary": "In-depth guide to distributed architectures, event-driven microservices, consensus protocols (Raft, Paxos), partitioning, caching patterns, and high-availability cloud deployments.",
                    "chapters": [
                        {"chapter": 1, "title": "Reliability, Scalability, and Maintainability", "pages": "1-45", "summary": "Core architectural trade-offs, service-level objectives (SLOs), fault tolerance, and load scaling patterns."},
                        {"chapter": 2, "title": "Data Models and Query Languages", "pages": "46-95", "summary": "Relational vs document vs graph data models; read-heavy vs write-heavy architectural profiles."},
                        {"chapter": 3, "title": "Storage and Retrieval Engines", "pages": "96-150", "summary": "LSM-Trees vs B-Trees, transaction logs, bloom filters, and column-oriented analytics engines."},
                        {"chapter": 4, "title": "Replication and Consensus Protocols", "pages": "151-220", "summary": "Single-leader, multi-leader, leaderless quorum consensus (Dynamo style), split-brain mitigation, and Raft leader elections."}
                    ],
                    "key_points": [
                        "CAP theorem and PACELC dictate fundamental trade-offs between consistency and latency during network partitions.",
                        "Event-driven CQRS separates read queries from mutation commands for massive parallel scale.",
                        "Raft consensus delivers deterministic replicated state machines across fault-tolerant clusters."
                    ],
                    "definitions": [
                        {"term": "Idempotency", "definition": "A property of operations where making multiple identical requests has the same net effect as making a single request."},
                        {"term": "Split-Brain", "definition": "A condition where two or more nodes simultaneously believe they are the authoritative cluster leader, risking state divergence."}
                    ]
                }
            )
            db.add(tb3)
            db.flush()

        db.commit()
        print("[DATABASE] Successfully synchronized all demo accounts (Alex, Priya, Rohan) and isolated demo textbooks!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

