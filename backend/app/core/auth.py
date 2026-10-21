from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from app.core.config import settings
import uuid

security = HTTPBearer(auto_error=False)

DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Extract user_id from JWT or return demo user ID."""
    if credentials is None:
        return DEMO_USER_ID

    token = credentials.credentials

    # Demo token
    if token == "demo-token":
        return DEMO_USER_ID

    if not settings.SUPABASE_JWT_SECRET:
        return DEMO_USER_ID

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

def require_admin(user_id: str = Depends(get_current_user)) -> str:
    """Check admin role — real check done via DB query in endpoints."""
    return user_id
