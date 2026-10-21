from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.db.database import get_db
from app.db.models import Profile
from app.core.auth import get_current_user
from app.schemas.profile import ProfileOut, ProfileUpdate

router = APIRouter(prefix="/api/profile", tags=["Profile"])

@router.get("", response_model=ProfileOut)
async def get_profile(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve profile for the authenticated user, creating a default one if not found."""
    stmt = select(Profile).where(Profile.user_id == user_id)
    res = await db.execute(stmt)
    profile = res.scalar_one_or_none()

    if not profile:
        profile = Profile(
            user_id=user_id,
            full_name="Student User" if user_id == "00000000-0000-0000-0000-000000000001" else None,
            skills=["Python", "SQL", "React", "Git"],
            programming_languages=["Python", "JavaScript", "SQL"],
            frameworks=["React", "FastAPI"],
            certifications=[],
            project_titles=["Portfolio Website", "Task Manager"],
            degree="B.Tech",
            specialization="Computer Science",
            graduation_year=2026,
            role="student"
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)

    return profile

@router.patch("", response_model=ProfileOut)
async def update_profile(
    update_data: ProfileUpdate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update profile fields for the authenticated user."""
    stmt = select(Profile).where(Profile.user_id == user_id)
    res = await db.execute(stmt)
    profile = res.scalar_one_or_none()

    if not profile:
        profile = Profile(user_id=user_id)
        db.add(profile)

    data = update_data.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(profile, field, value)

    profile.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(profile)
    return profile
