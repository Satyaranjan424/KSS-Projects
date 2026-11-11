from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends
from app.schemas.common import StandardResponse
from app.core.security import get_current_user
from app.database.supabase import is_supabase_configured
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/me", response_model=StandardResponse[Optional[Dict[str, Any]]])
def get_me(user: Optional[Dict[str, Any]] = Depends(get_current_user)):
    """
    Verify and return current authenticated user details from Supabase JWT.
    """
    if not user:
        return StandardResponse(
            success=False,
            message="Unauthenticated",
            data=None
        )

    return StandardResponse(
        success=True,
        message="User authenticated successfully",
        data={
            "id": user.get("sub"),
            "email": user.get("email"),
            "role": user.get("role") or user.get("user_metadata", {}).get("role", "authenticated"),
            "app_metadata": user.get("app_metadata", {}),
            "user_metadata": user.get("user_metadata", {})
        }
    )


@router.get("/status", response_model=StandardResponse[Dict[str, Any]])
def get_auth_status():
    """
    Check Supabase Authentication & Database connection status.
    """
    return StandardResponse(
        success=True,
        message="Auth and backend status check",
        data={
            "supabase_configured": is_supabase_configured(),
            "environment": settings.ENVIRONMENT,
            "storage_bucket": settings.STORAGE_BUCKET_NAME
        }
    )

