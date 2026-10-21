from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
@router.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "service": "Internship Tracker AI",
        "version": "1.0.0",
        "db": "connected",
        "ai": settings.AI_PROVIDER
    }
