from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from datetime import datetime
from database.postgres import get_db
from models.models import User, StudentProfile, StudentInterests, LearningPreferences, LoginActivity, LearningProgress

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    learner_type: str = "college" # "school", "college", "professional", "independent"
    # Specific academic/professional fields
    institution: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    semester: Optional[str] = None
    board: Optional[str] = None
    class_grade: Optional[str] = None
    job_role: Optional[str] = None
    industry: Optional[str] = None
    # Interests & preferences
    subjects: Optional[List[str]] = []
    goals: Optional[List[str]] = []
    personal_interests: Optional[List[str]] = []
    preferred_language: Optional[str] = "English"
    learning_style: Optional[List[str]] = []
    voice_assistance: Optional[bool] = False
    text_to_speech: Optional[bool] = False
    speech_input: Optional[bool] = False
    larger_text: Optional[bool] = False
    simplified_explanations: Optional[bool] = False

class LoginRequest(BaseModel):
    email: str
    password: str
    portal: Optional[str] = "student" # "student" or "admin"

@router.post("/signup")
def register_user(req: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    new_user = User(
        name=req.name,
        email=req.email,
        password_hash=req.password, # Production: passlib bcrypt
        phone=req.phone,
        dob=req.dob,
        gender=req.gender,
        role="student", # User cannot assign admin role on signup
        is_active=True
    )
    db.add(new_user)
    db.flush()

    # Profile
    profile = StudentProfile(
        user_id=new_user.id,
        learner_type=req.learner_type,
        institution=req.institution,
        department=req.department,
        year=req.year,
        semester=req.semester,
        board=req.board,
        class_grade=req.class_grade,
        job_role=req.job_role,
        industry=req.industry
    )
    db.add(profile)

    # Interests
    interests = StudentInterests(
        user_id=new_user.id,
        subjects=req.subjects,
        goals=req.goals,
        personal_interests=req.personal_interests
    )
    db.add(interests)

    # Preferences
    preferences = LearningPreferences(
        user_id=new_user.id,
        preferred_language=req.preferred_language,
        learning_style=req.learning_style,
        voice_assistance=req.voice_assistance,
        text_to_speech=req.text_to_speech,
        speech_input=req.speech_input,
        larger_text=req.larger_text,
        simplified_explanations=req.simplified_explanations
    )
    db.add(preferences)

    # Learning Progress initialization
    progress = LearningProgress(
        user_id=new_user.id,
        completed_topics=0,
        quiz_scores_avg=0.0,
        streak_days=1,
        badges=["New Explorer"]
    )
    db.add(progress)

    # Create initial login activity record
    activity = LoginActivity(
        user_id=new_user.id,
        session_status="active",
        device_info="Web App Signup"
    )
    db.add(activity)

    db.commit()
    db.refresh(new_user)

    return {
        "success": True,
        "message": "Account created successfully.",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
            "learner_type": req.learner_type
        }
    }

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if user.password_hash != req.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Your account has been deactivated. Please contact support.")

    # Check portal access
    if req.portal == "admin" and user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Admin credentials required.")

    # Record login activity
    act = LoginActivity(
        user_id=user.id,
        login_timestamp=datetime.utcnow(),
        session_status="active",
        device_info=f"Web ({req.portal.capitalize()} Portal)"
    )
    db.add(act)
    db.commit()

    return {
        "success": True,
        "token": f"aarva_session_{user.id}_{int(datetime.utcnow().timestamp())}",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "learner_type": user.profile.learner_type if user.profile else "student"
        }
    }

@router.post("/logout")
def logout(user_id: int, db: Session = Depends(get_db)):
    latest_session = db.query(LoginActivity).filter(
        LoginActivity.user_id == user_id,
        LoginActivity.session_status == "active"
    ).order_by(LoginActivity.login_timestamp.desc()).first()

    if latest_session:
        latest_session.logout_timestamp = datetime.utcnow()
        latest_session.session_status = "completed"
        db.commit()

    return {"success": True, "message": "Logged out successfully."}
