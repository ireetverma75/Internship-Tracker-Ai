"""Security, authentication utilities, and input sanitization."""
import html
from typing import Optional
from fastapi import Header, HTTPException, status


def sanitize_text(text: Optional[str]) -> Optional[str]:
    """Sanitize user-provided plain text to prevent script injection."""
    if text is None:
        return None
    # Escape HTML tags
    cleaned = html.escape(text.strip())
    return cleaned


def get_current_user_id(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """
    Extract user ID from Authorization header.
    In demo mode, permits demo token or returns default demo user ID.
    If Supabase JWT is present, can decode claims.
    """
    if not authorization:
        return "demo-user-default"
    
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        token = parts[1]
        if token in ("demo-token", "anonymous"):
            return "demo-user-default"
        # When cloud Supabase is configured, token can be verified here
        return f"user_{token[:8]}"
        
    return "demo-user-default"
