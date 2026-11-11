from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.core.config import settings

# HTTP Bearer scheme
security = HTTPBearer(auto_error=False)


def verify_supabase_jwt(token: str) -> Dict[str, Any]:
    """
    Verify Supabase JWT token using the Supabase JWT secret or decode payload.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # If Supabase JWT Secret is configured and not a placeholder, verify signature
    if settings.SUPABASE_JWT_SECRET and "your-supabase" not in settings.SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.PyJWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # In dev/mock mode without configured secret, decode unverified for structure inspection
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Unable to parse token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[Dict[str, Any]]:
    """
    Extract user from Bearer token if present. Returns None if unauthenticated.
    """
    if not credentials:
        return None
    return verify_supabase_jwt(credentials.credentials)


async def require_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Dict[str, Any]:
    """
    Require authenticated admin user.
    """
    from app.database.supabase import is_supabase_configured

    if not credentials:
        # If in development mode or Supabase credentials are not configured, allow seamless access
        if settings.ENVIRONMENT == "development" or not is_supabase_configured():
            return {"role": "service_role", "sub": "dev-admin", "email": "admin@kalpanaam.com"}

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required for administrative actions",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = verify_supabase_jwt(credentials.credentials)
    
    # Check role
    role = user.get("role") or user.get("user_metadata", {}).get("role")
    if role not in ["admin", "service_role", "authenticated"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required"
        )
    return user

