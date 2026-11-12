"""
Admin Password Verification & Short-lived Session Token Endpoint.

POST /api/v1/admin/verify-password
  - Accepts { "password": "..." }
  - Verifies against bcrypt hash stored in ADMIN_PASSWORD_HASH env var
  - On success: issues a signed JWT (HS256) valid for ADMIN_SESSION_DURATION seconds (default 15 min)
  - The signed token is returned to the frontend; it must be sent as
    Authorization: Bearer <token> on every protected API request.

GET /api/v1/admin/verify-session
  - Checks whether a bearer token is still valid (used by frontend to validate cached tokens)
"""

from datetime import datetime, timezone, timedelta
from typing import Optional
import logging

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import jwt

from app.core.config import settings

logger = logging.getLogger("admin_auth")

router = APIRouter(prefix="/admin", tags=["Admin"])

# ---------------------------------------------------------------------------
# Lazy-import bcrypt so the app still starts if bcrypt is not installed yet
# ---------------------------------------------------------------------------
def _bcrypt_verify(plain: str, hashed: str) -> bool:
    try:
        import bcrypt  # type: ignore
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception as exc:
        logger.error("bcrypt error: %s", exc)
        return False


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
_ALGORITHM = "HS256"
_TOKEN_TYPE = "admin_session"


def _get_secret() -> str:
    secret = settings.ADMIN_SESSION_SECRET
    if not secret:
        # Fallback: derive from supabase jwt secret so it's not empty
        secret = settings.SUPABASE_JWT_SECRET or "kss-admin-fallback-secret-change-me"
    return secret


def _issue_token(duration_seconds: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "type": _TOKEN_TYPE,
        "iat": now,
        "exp": now + timedelta(seconds=duration_seconds),
    }
    return jwt.encode(payload, _get_secret(), algorithm=_ALGORITHM)


def _decode_token(token: str) -> dict:
    """Decode and validate an admin session token. Raises HTTPException on failure."""
    try:
        payload = jwt.decode(
            token,
            _get_secret(),
            algorithms=[_ALGORITHM],
        )
        if payload.get("type") != _TOKEN_TYPE:
            raise ValueError("Wrong token type")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin session has expired. Please verify your password again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (jwt.PyJWTError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid admin token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ---------------------------------------------------------------------------
# FastAPI dependency — reused by projects router
# ---------------------------------------------------------------------------
_bearer = HTTPBearer(auto_error=False)


def require_admin_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> dict:
    """
    Dependency: validates the short-lived admin session JWT.
    Use as: admin = Depends(require_admin_token)
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authorization required. Please verify your password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _decode_token(credentials.credentials)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class PasswordVerifyRequest(BaseModel):
    password: str


class AdminTokenResponse(BaseModel):
    token: str
    expires_in: int   # seconds


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@router.post(
    "/verify-password",
    response_model=AdminTokenResponse,
    summary="Verify admin password and obtain a short-lived session token",
)
def verify_admin_password(body: PasswordVerifyRequest):
    """
    Accepts the admin password, verifies it against the stored bcrypt hash,
    and returns a signed JWT valid for ADMIN_SESSION_DURATION seconds.
    Never exposes the hash or the raw password.
    """
    pw_hash = settings.ADMIN_PASSWORD_HASH

    if not pw_hash:
        # No hash configured — only allow in development with env ENVIRONMENT=development
        if settings.ENVIRONMENT == "development":
            logger.warning(
                "ADMIN_PASSWORD_HASH not set; "
                "accepting any password in development mode."
            )
            # In dev with no hash set, still issue a token so the UI flow works
            token = _issue_token(settings.ADMIN_SESSION_DURATION)
            return AdminTokenResponse(token=token, expires_in=settings.ADMIN_SESSION_DURATION)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin authentication is not configured on this server.",
        )

    if not _bcrypt_verify(body.password, pw_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect admin password.",
        )

    token = _issue_token(settings.ADMIN_SESSION_DURATION)
    return AdminTokenResponse(token=token, expires_in=settings.ADMIN_SESSION_DURATION)


@router.get(
    "/verify-session",
    summary="Check whether the current admin session token is still valid",
)
def verify_session(
    admin: dict = Depends(require_admin_token),
):
    """
    Returns 200 if the bearer token is a valid, non-expired admin session.
    Returns 401 if missing or expired.
    """
    exp_ts = admin.get("exp", 0)
    remaining = max(0, int(exp_ts - datetime.now(timezone.utc).timestamp()))
    return {
        "valid": True,
        "expires_in": remaining,
    }

