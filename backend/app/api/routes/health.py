"""Health check endpoint."""
from fastapi import APIRouter
from app.core.config import settings
from app.services.ai_provider import ai_provider

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ai_live_provider_configured": ai_provider.is_live_configured,
        "database": settings.DATABASE_URL.split("://")[0]
    }
