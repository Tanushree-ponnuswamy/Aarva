import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import uuid
import bcrypt
try:
    import jwt
    from jwt.exceptions import PyJWTError as JWTError
except ImportError:
    from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from config import settings
from database.postgres import get_db
from models.models import User, UserSession

# Configuration (single source of truth lives in config.py; no secrets in source)
SECRET_KEY = settings.JWT_SECRET
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = max(1, settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES // 60)

security = HTTPBearer(auto_error=False)


class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a plaintext password using bcrypt."""
        # Bcrypt has a 72-byte max length limitation
        pw_bytes = password[:72].encode("utf-8")
        salt = bcrypt.gensalt(rounds=settings.BCRYPT_ROUNDS)
        return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against a bcrypt hash. Plaintext comparison is never allowed."""
        if not hashed_password or not hashed_password.startswith(("$2a$", "$2b$", "$2y$")):
            return False
        try:
            pw_bytes = plain_password[:72].encode("utf-8")
            return bcrypt.checkpw(pw_bytes, hashed_password.encode("utf-8"))
        except Exception:
            return False

    @staticmethod
    def create_access_token(
        data: Dict[str, Any],
        expires_delta: Optional[timedelta] = None
    ) -> tuple[str, str]:
        """Generate a signed JWT token. Returns (token, jti)."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)

        jti = str(uuid.uuid4())
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "jti": jti
        })
        token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return token, jti

    @staticmethod
    def decode_token(token: str) -> Optional[Dict[str, Any]]:
        """Decode and validate a JWT token."""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None


auth_service = AuthService()


def get_current_user(
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency to extract and verify the authenticated user from the Bearer token.
    """
    if not auth_header or not auth_header.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_header.credentials
    payload = auth_service.decode_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    jti = payload.get("jti")
    if not jti:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("user_id") or payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing user identification.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # If user_id is an email string, lookup by email, else lookup by int id
    if isinstance(user_id, int) or (isinstance(user_id, str) and user_id.isdigit()):
        user = db.query(User).filter(User.id == int(user_id)).first()
    else:
        user = db.query(User).filter(User.email == str(user_id)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact administrator.",
        )

    # Server-side session check: makes logout / session revocation actually work.
    session = db.query(UserSession).filter(
        UserSession.token_jti == jti,
        UserSession.user_id == user.id,
        UserSession.is_active == True,  # noqa: E712
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has ended. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def require_self_or_admin(user_id: int, current_user: User) -> None:
    """Raise 403 unless the caller is acting on their own data (or is an admin)."""
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own data.",
        )


def get_owned_textbook(db: Session, textbook_id: int, current_user: User):
    """Return the textbook if it belongs to the caller (admins may access any); else 404."""
    from models.models import Textbook  # local import avoids import cycles
    book = db.query(Textbook).filter(Textbook.id == textbook_id).first()
    if not book or (current_user.role != "admin" and book.user_id != current_user.id):
        # 404 (not 403) so users cannot probe which textbook ids exist.
        raise HTTPException(status_code=404, detail="Textbook not found.")
    return book


def get_current_active_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Dependency to verify user is an active administrator."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required.",
        )
    return current_user
