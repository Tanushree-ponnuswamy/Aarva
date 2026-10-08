from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database.postgres import get_db
from models.models import (
    User, StudentProfile, StudentInterests, LearningPreferences,
    LoginActivity, LearningProgress, UserSession, ChatSession
)
from services.auth_service import auth_service, get_current_user, ACCESS_TOKEN_EXPIRE_HOURS
from services.email_service import email_service

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# ── Request / Response Models ─────────────────────────────────────────────

class SendOtpRequest(BaseModel):
    email: str
    length: Optional[int] = 4

class VerifyOtpRequest(BaseModel):
    email: str
    code: str

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    learner_type: str = "college"
    institution: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    semester: Optional[str] = None
    board: Optional[str] = None
    class_grade: Optional[str] = None
    job_role: Optional[str] = None
    industry: Optional[str] = None
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
    # portal is ignored — only students can log in via this endpoint
    portal: Optional[str] = "student"


# ── OTP Email Dispatch & Verification ─────────────────────────────────────

@router.post("/send-otp")
def send_verification_otp(req: SendOtpRequest):
    """Generate a 4-digit verification code and dispatch real email via SMTP."""
    email = req.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")

    code = email_service.generate_otp(email, length=req.length or 4)
    dispatch_result = email_service.send_verification_email(email, code)
    
    return {
        "status": "success" if dispatch_result.get("success") else "dispatched_with_fallback",
        "email": email,
        "message": dispatch_result.get("message", "Verification code dispatched."),
        "preview_code": code  # Available for development / test flows
    }


@router.post("/verify-otp")
def verify_otp_endpoint(req: VerifyOtpRequest):
    """Validate user entered OTP code."""
    is_valid = email_service.verify_otp(req.email, req.code)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code. Please check your inbox or resend code.")
    return {"status": "verified", "message": "Email verified successfully."}


# ── Helpers ───────────────────────────────────────────────────────────────

def _create_user_session(
    db: Session,
    user: User,
    jti: str,
    request: Optional[Request] = None,
    device_info: str = "Web Browser",
) -> UserSession:
    """Persist a new UserSession row in PostgreSQL."""
    ip = None
    ua = None
    if request:
        ip = request.client.host if request.client else None
        ua = request.headers.get("user-agent", "")[:300]

    session = UserSession(
        user_id=user.id,
        token_jti=jti,
        ip_address=ip,
        user_agent=ua,
        device_info=device_info,
        is_active=True,
        created_at=datetime.utcnow(),
        last_seen_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS),
    )
    db.add(session)
    return session


# ── Signup ────────────────────────────────────────────────────────────────

@router.post("/signup")
def register_user(req: SignupRequest, request: Request, db: Session = Depends(get_db)):
    """Register a new student account and return a JWT token."""
    existing = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    hashed_pw = auth_service.hash_password(req.password)

    new_user = User(
        name=req.name.strip(),
        email=req.email.strip().lower(),
        password_hash=hashed_pw,
        phone=req.phone,
        dob=req.dob,
        gender=req.gender,
        role="student",
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    db.add(StudentProfile(
        user_id=new_user.id,
        learner_type=req.learner_type,
        institution=req.institution,
        department=req.department,
        year=req.year,
        semester=req.semester,
        board=req.board,
        class_grade=req.class_grade,
        job_role=req.job_role,
        industry=req.industry,
    ))

    db.add(StudentInterests(
        user_id=new_user.id,
        subjects=req.subjects or [],
        goals=req.goals or [],
        personal_interests=req.personal_interests or [],
    ))

    db.add(LearningPreferences(
        user_id=new_user.id,
        preferred_language=req.preferred_language or "English",
        learning_style=req.learning_style or [],
        voice_assistance=req.voice_assistance or False,
        text_to_speech=req.text_to_speech or False,
        speech_input=req.speech_input or False,
        larger_text=req.larger_text or False,
        simplified_explanations=req.simplified_explanations or False,
    ))

    db.add(LearningProgress(
        user_id=new_user.id,
        completed_topics=0,
        quiz_scores_avg=0.0,
        streak_days=1,
        badges=["New Explorer"],
    ))

    # LoginActivity record
    db.add(LoginActivity(
        user_id=new_user.id,
        session_status="active",
        device_info="Web App Signup",
    ))

    db.flush()

    # JWT + UserSession
    token, jti = auth_service.create_access_token({
        "sub": new_user.email,
        "user_id": new_user.id,
        "role": new_user.role,
        "email": new_user.email,
    })
    _create_user_session(db, new_user, jti, request, "Web App Signup")

    db.commit()
    db.refresh(new_user)

    return {
        "success": True,
        "message": "Account created successfully.",
        "token": token,
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
            "learner_type": req.learner_type,
        },
    }


# ── Login ─────────────────────────────────────────────────────────────────

@router.post("/login")
def login(req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """
    Student-only login.
    - Validates credentials
    - Enforces role == 'student'
    - Creates a UserSession row in PostgreSQL
    - Creates a LoginActivity row
    - Returns a signed JWT
    """
    email_clean = req.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()

    # Generic error to avoid email enumeration
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    is_valid = auth_service.verify_password(req.password, user.password_hash)
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    # Upgrade plain seed passwords to bcrypt on first real login
    if not user.password_hash.startswith(("$2a$", "$2b$", "$2y$")):
        user.password_hash = auth_service.hash_password(req.password)

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Your account has been deactivated. Please contact support.",
        )

    # ── STUDENT-ONLY ENFORCEMENT ─────────────────────────────────────────
    if user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Access denied. This portal is for students only.",
        )

    # Record LoginActivity
    db.add(LoginActivity(
        user_id=user.id,
        login_timestamp=datetime.utcnow(),
        session_status="active",
        device_info="Web (Student Portal)",
        ip_address=(request.client.host if request.client else "unknown"),
    ))
    db.flush()

    # Generate JWT and create UserSession
    token, jti = auth_service.create_access_token({
        "sub": user.email,
        "user_id": user.id,
        "role": user.role,
        "email": user.email,
    })
    _create_user_session(db, user, jti, request, "Web (Student Portal)")

    db.commit()

    return {
        "success": True,
        "token": token,
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "learner_type": user.profile.learner_type if user.profile else "student",
        },
    }


# ── Current User ──────────────────────────────────────────────────────────

@router.get("/me")
def get_current_user_profile(user: User = Depends(get_current_user)):
    """Return the profile of the authenticated student from JWT."""
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "learner_type": user.profile.learner_type if user.profile else "student",
        "institution": user.profile.institution if user.profile else None,
        "department": user.profile.department if user.profile else None,
        "preferred_language": user.preferences.preferred_language if user.preferences else "English",
        "progress": {
            "xp": user.progress.xp if user.progress else 0,
            "level": user.progress.level if user.progress else 1,
            "streak_days": user.progress.streak_days if user.progress else 1,
            "badges": user.progress.badges if user.progress else [],
        },
    }


# ── Logout ────────────────────────────────────────────────────────────────

@router.post("/logout")
def logout(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Invalidate the active UserSession and close the LoginActivity.
    Requires a valid Bearer token.
    """
    # Invalidate all active user sessions (simple: mark all for this user as inactive)
    active_sessions = db.query(UserSession).filter(
        UserSession.user_id == user.id,
        UserSession.is_active == True
    ).all()
    for s in active_sessions:
        s.is_active = False
        s.logged_out_at = datetime.utcnow()

    # Close latest LoginActivity
    latest_activity = db.query(LoginActivity).filter(
        LoginActivity.user_id == user.id,
        LoginActivity.session_status == "active",
    ).order_by(LoginActivity.login_timestamp.desc()).first()
    if latest_activity:
        latest_activity.logout_timestamp = datetime.utcnow()
        latest_activity.session_status = "completed"

    db.commit()
    return {"success": True, "message": "Logged out successfully."}


# ── Active Sessions (for profile/settings display) ────────────────────────

@router.get("/sessions")
def get_sessions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return the user's active login sessions."""
    sessions = db.query(UserSession).filter(
        UserSession.user_id == user.id,
        UserSession.is_active == True,
    ).order_by(UserSession.created_at.desc()).all()

    return {
        "sessions": [
            {
                "id": s.id,
                "device_info": s.device_info,
                "ip_address": s.ip_address,
                "created_at": s.created_at.isoformat() if s.created_at else None,
                "last_seen_at": s.last_seen_at.isoformat() if s.last_seen_at else None,
                "expires_at": s.expires_at.isoformat() if s.expires_at else None,
            }
            for s in sessions
        ]
    }


# ── Chat Sessions ─────────────────────────────────────────────────────────

@router.get("/chat-sessions")
def get_chat_sessions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return the user's chat sessions."""
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == user.id,
    ).order_by(ChatSession.updated_at.desc()).all()

    return {
        "chat_sessions": [
            {
                "id": s.id,
                "textbook_id": s.textbook_id,
                "session_title": s.session_title,
                "is_active": s.is_active,
                "message_count": s.message_count,
                "created_at": s.created_at.isoformat() if s.created_at else None,
                "updated_at": s.updated_at.isoformat() if s.updated_at else None,
            }
            for s in sessions
        ]
    }
