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
from services.rate_limit import rate_limiter, client_ip
from config import settings

DEMO_EMAIL = "student@college.edu"

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# ── Request / Response Models ─────────────────────────────────────────────

class SendOtpRequest(BaseModel):
    email: str
    length: Optional[int] = 4
    purpose: Optional[str] = None  # "forgot_password" | "signup" | None
    require_registered: Optional[bool] = False

class CheckEmailRequest(BaseModel):
    email: str

class VerifyOtpRequest(BaseModel):
    email: str
    code: str

class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

    @property
    def password_valid(self) -> bool:
        return len(self.password) >= 10
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
    device_info: Optional[str] = "Web Browser"
    # portal is ignored — only students can log in via this endpoint
    portal: Optional[str] = "student"


class DemoLoginRequest(BaseModel):
    email: Optional[str] = "student@college.edu"
    persona: Optional[str] = None  # "college" | "school" | "professional"


def _user_to_dict(user: User) -> dict:
    profile = user.profile
    interests = user.interests
    preferences = user.preferences
    progress = user.progress
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "learner_type": profile.learner_type if profile else "college",
        "institution": profile.institution if profile else "",
        "department": profile.department if profile else "",
        "year": profile.year if profile else "",
        "semester": profile.semester if profile else "",
        "board": profile.board if profile else "",
        "class_grade": profile.class_grade if profile else "",
        "job_role": profile.job_role if profile else "",
        "industry": profile.industry if profile else "",
        "goals": interests.goals if interests else [],
        "subjects": interests.subjects if interests else [],
        "personal_interests": interests.personal_interests if interests else [],
        "preferred_language": preferences.preferred_language if preferences else "English",
        "learning_style": preferences.learning_style if preferences else [],
        "streak_days": progress.streak_days if progress else 1,
        "completed_topics": progress.completed_topics if progress else 0,
        "quiz_scores_avg": progress.quiz_scores_avg if progress else 0.0,
    }



# ── OTP Email Dispatch & Verification ─────────────────────────────────────

@router.post("/check-email")
def check_email_registered(req: CheckEmailRequest, request: Request, db: Session = Depends(get_db)):
    """Tell the UI whether an email is registered. Returns ONLY a boolean (no name/role leak)."""
    rate_limiter.hit(f"check-email:{client_ip(request)}", limit=20, window_seconds=300)
    email = req.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    return {"email": email, "is_registered": bool(user)}


@router.post("/send-otp")
def send_verification_otp(req: SendOtpRequest, request: Request, db: Session = Depends(get_db)):
    """
    Generate a 4-digit verification code and dispatch real email via SMTP.
    If require_registered is True or purpose == 'forgot_password', verifies that
    the account is already registered before dispatching the code.
    """
    rate_limiter.hit(f"send-otp-ip:{client_ip(request)}", limit=10, window_seconds=3600)
    email = req.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")

    user = db.query(User).filter(User.email == email).first()

    # Pre-check: if attempting forgot password or require_registered is specified
    if req.purpose == "forgot_password" or req.require_registered:
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User does not exist. Please check your email or create an account."
            )

    # Pre-check: if attempting signup
    if req.purpose == "signup" and user:
        raise HTTPException(
            status_code=400,
            detail="An account is already registered with this email. Please sign in instead."
        )

    try:
        code = email_service.generate_otp(email, length=req.length or 4)
    except ValueError as e:
        if str(e) == "cooldown":
            raise HTTPException(status_code=429, detail="Please wait a minute before requesting another code.")
        raise HTTPException(status_code=429, detail="Too many codes requested for this address. Try again later.")
    dispatch_result = email_service.send_verification_email(email, code)
    
    if not dispatch_result.get("success"):
        email_service.discard_otp(email)
        if req.purpose == "signup" and settings.ALLOW_SIGNUP_WITHOUT_EMAIL_VERIFICATION:
            # Mail is down: do not lock new users out. Password reset still requires the emailed code.
            print(f"[AUTH] Signup continuing without email verification for {email}: {dispatch_result.get('error')}")
            return {
                "status": "success",
                "email": email,
                "message": "Email verification is temporarily unavailable; you can continue.",
                "is_registered": bool(user),
                "verification_skipped": True,
            }
        reason = {
            "unreachable": "our mail server could not be reached",
            "auth": "our mail account login was rejected",
            "config": "email sending is not configured yet",
        }.get(dispatch_result.get("error_kind"), "the email could not be sent")
        raise HTTPException(
            status_code=502,
            detail=f"Unable to deliver the verification code to {email} ({reason}). Please try again in a moment."
        )

    return {
        "status": "success",
        "email": email,
        "message": f"Verification code sent to {email}.",
        "is_registered": bool(user)
    }


@router.post("/verify-otp")
def verify_otp_endpoint(req: VerifyOtpRequest, request: Request):
    """Validate user entered OTP code."""
    rate_limiter.hit(f"verify-otp-ip:{client_ip(request)}", limit=30, window_seconds=900)
    is_valid = email_service.verify_otp(req.email, req.code)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code. Please check your inbox or resend code.")
    return {"status": "verified", "message": "Email verified successfully."}


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, request: Request, db: Session = Depends(get_db)):
    """Validate OTP and reset the user's password."""
    rate_limiter.hit(f"reset-ip:{client_ip(request)}", limit=15, window_seconds=900)
    email = req.email.strip().lower()
    if len(req.new_password) < 10:
        raise HTTPException(status_code=400, detail="Password must be at least 10 characters long.")

    is_valid = email_service.verify_otp(email, req.code)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code.")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account registered with this email address.")

    user.password_hash = auth_service.hash_password(req.new_password)

    # A password reset must kill every existing session (stolen tokens stop working).
    for old in db.query(UserSession).filter(UserSession.user_id == user.id, UserSession.is_active == True).all():  # noqa: E712
        old.is_active = False
        old.logged_out_at = datetime.utcnow()

    # Auto-login: generate token & session
    token, jti = auth_service.create_access_token({
        "sub": user.email,
        "user_id": user.id,
        "role": user.role,
        "email": user.email,
    })
    _create_user_session(db, user, jti, request, "Password Reset")
    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": "Password reset successfully.",
        "token": token,
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }


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
    rate_limiter.hit(f"signup-ip:{client_ip(request)}", limit=10, window_seconds=3600)
    if not req.password_valid:
        raise HTTPException(status_code=400, detail="Password must be at least 10 characters long.")

    email_clean = req.email.strip().lower()


    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    hashed_pw = auth_service.hash_password(req.password)

    new_user = User(
        name=req.name.strip(),
        email=email_clean,
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
        "user": _user_to_dict(new_user),
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
    - Returns a signed JWT and complete user profile details
    """
    ip = client_ip(request)
    email_clean = req.email.strip().lower()
    rate_limiter.hit(f"login-ip:{ip}", limit=30, window_seconds=900)
    rate_limiter.hit(f"login-email:{email_clean}", limit=8, window_seconds=900)

    user = db.query(User).filter(User.email == email_clean).first()

    # Same generic error for "no such user" and "wrong password" (no account enumeration,
    # and no password-length hint: length rules apply when a password is CREATED, not checked).
    if not user or not auth_service.verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Account is deactivated. Please contact administrator."
        )

    # Strict Role Guard: Only students can authenticate through this student portal
    if user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Access restricted. Please use the designated administration portal."
        )

    # Record login activity
    activity = LoginActivity(
        user_id=user.id,
        login_timestamp=datetime.utcnow(),
        session_status="active",
        device_info=req.device_info or "Web Browser",
        ip_address=ip
    )
    db.add(activity)
    db.flush()

    # Generate JWT Token with unique jti and persist UserSession
    token, jti = auth_service.create_access_token({
        "sub": user.email,
        "user_id": user.id,
        "role": user.role,
        "email": user.email,
    })
    _create_user_session(db, user, jti, request, req.device_info)
    db.commit()

    return {
        "success": True,
        "token": token,
        "access_token": token,
        "token_type": "bearer",
        "user": _user_to_dict(user),
    }


@router.post("/admin-login")
def admin_login(req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """Admin sign-in (separate from the student portal). Same generic errors and rate limits."""
    email_clean = req.email.strip().lower()
    rate_limiter.hit(f"admin-login-ip:{client_ip(request)}", limit=10, window_seconds=900)
    rate_limiter.hit(f"admin-login-email:{email_clean}", limit=5, window_seconds=900)

    user = db.query(User).filter(User.email == email_clean).first()
    if (not user or user.role != "admin"
            or not auth_service.verify_password(req.password, user.password_hash)):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated.")

    token, jti = auth_service.create_access_token(
        {"sub": user.email, "user_id": user.id, "role": user.role, "email": user.email},
        expires_delta=timedelta(hours=8),
    )
    _create_user_session(db, user, jti, request, "Admin Portal")
    db.commit()
    return {"success": True, "token": token, "access_token": token, "token_type": "bearer",
            "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}


@router.post("/demo-login")
def demo_login(req: DemoLoginRequest, request: Request, db: Session = Depends(get_db)):
    """
    Log in as the shared sample student (Alex Morgan). Disabled unless ENABLE_DEMO_LOGIN=true.
    Only ever returns a token for the dedicated demo account: never any other user,
    never re-activates a disabled account, never creates one on the fly.
    """
    if not settings.ENABLE_DEMO_LOGIN:
        raise HTTPException(status_code=404, detail="Demo login is disabled.")
    rate_limiter.hit(f"demo-ip:{client_ip(request)}", limit=20, window_seconds=900)

    user = db.query(User).filter(User.email == DEMO_EMAIL, User.role == "student").first()
    if not user or not user.is_active:
        raise HTTPException(status_code=503, detail="Demo account is not available right now.")

    db.add(LoginActivity(
        user_id=user.id,
        login_timestamp=datetime.utcnow(),
        session_status="active",
        device_info=f"Demo Login ({user.name})",
        ip_address=client_ip(request),
    ))
    db.flush()

    token, jti = auth_service.create_access_token(
        {"sub": user.email, "user_id": user.id, "role": user.role, "email": user.email},
        expires_delta=timedelta(hours=8),  # demo sessions are short-lived
    )
    _create_user_session(db, user, jti, request, f"Demo Login ({user.name})")
    db.commit()

    return {
        "success": True,
        "token": token,
        "access_token": token,
        "token_type": "bearer",
        "user": _user_to_dict(user),
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
