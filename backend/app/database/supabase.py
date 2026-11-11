import logging
from typing import Optional, Any
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger("app.database.supabase")

_supabase_client: Optional[Client] = None


def is_supabase_configured() -> bool:
    """
    Check if valid Supabase credentials have been configured (not empty and not default placeholders).
    """
    url = (settings.SUPABASE_URL or "").strip()
    if not url or "your-project-id" in url or "example.com" in url:
        return False
    api_key = (settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY or "").strip()
    if not api_key or "your-supabase" in api_key:
        return False
    return True


def get_supabase_client() -> Optional[Client]:
    """
    Returns an initialized Supabase client instance.
    Uses SERVICE_ROLE_KEY if available for administrative database & storage operations,
    or ANON_KEY for public operations.
    Returns None if Supabase credentials are not configured or are placeholder values.
    """
    global _supabase_client

    if _supabase_client is not None:
        return _supabase_client

    if not is_supabase_configured():
        logger.info("Supabase not yet configured with real credentials. Operating in resilient offline mode.")
        return None

    api_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY

    try:
        _supabase_client = create_client(settings.SUPABASE_URL, api_key)
        logger.info("Successfully initialized official Supabase client.")
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {str(e)}")
        return None

