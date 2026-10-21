from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, desc
from typing import Optional
from datetime import datetime, date

from app.db.database import get_db
from app.db.models import Internship, SavedInternship, Profile
from app.core.auth import get_current_user
from app.services.matching import compute_match

router = APIRouter(prefix="/api/internships", tags=["Internships"])

def format_internship(item: Internship, is_saved: bool = False, match_details = None) -> dict:
    stipend_str = None
    if item.stipend_min and item.stipend_max:
        stipend_str = f"₹{item.stipend_min:,} - ₹{item.stipend_max:,}/mo"
    elif item.stipend_min:
        stipend_str = f"₹{item.stipend_min:,}/mo"

    return {
        "id": item.id,
        "company": item.company,
        "company_name": item.company,
        "role": item.title,
        "title": item.title,
        "description": item.description,
        "required_skills": item.required_skills or [],
        "preferred_skills": item.preferred_skills or [],
        "degree_requirement": item.degree_requirement,
        "eligibility": item.degree_requirement,
        "experience_level": item.experience_level,
        "location": item.location,
        "work_mode": item.work_mode,
        "stipend": stipend_str,
        "stipend_min": item.stipend_min,
        "stipend_max": item.stipend_max,
        "currency": item.currency,
        "job_url": item.official_url,
        "official_url": item.official_url,
        "deadline": item.deadline.isoformat() if item.deadline else None,
        "source": item.source,
        "is_demo": item.is_demo,
        "is_active": item.is_active,
        "is_saved": is_saved,
        "match_details": match_details.model_dump() if match_details else None,
        "match_score": int(match_details.score) if match_details else None,
        "created_at": item.created_at.isoformat() if item.created_at else None,
        "updated_at": item.updated_at.isoformat() if item.updated_at else None,
    }

@router.get("")
async def list_internships(
    q: Optional[str] = Query(None, alias="query"),
    work_mode: Optional[str] = None,
    is_saved: Optional[bool] = None,
    location: Optional[str] = None,
    skills: Optional[str] = None,
    stipend_min: Optional[int] = None,
    sort: Optional[str] = Query("newest", alias="sort_by"),
    sort_order: Optional[str] = "desc",
    page: Optional[int] = Query(None),
    per_page: Optional[int] = Query(20),
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve internships with filters, search, and matching score computation."""
    stmt = select(Internship).where(Internship.is_active == True)

    if q:
        search_pattern = f"%{q}%"
        stmt = stmt.where(
            or_(
                Internship.title.ilike(search_pattern),
                Internship.company.ilike(search_pattern),
                Internship.description.ilike(search_pattern)
            )
        )

    if work_mode and work_mode.lower() != "all":
        stmt = stmt.where(Internship.work_mode.ilike(work_mode))

    if location:
        stmt = stmt.where(Internship.location.ilike(f"%{location}%"))

    if stipend_min:
        stmt = stmt.where(Internship.stipend_min >= stipend_min)

    # Saved filter
    saved_stmt = select(SavedInternship.internship_id).where(SavedInternship.user_id == user_id)
    saved_res = await db.execute(saved_stmt)
    saved_ids = set(saved_res.scalars().all())

    if is_saved is True:
        stmt = stmt.where(Internship.id.in_(saved_ids))

    stmt = stmt.order_by(desc(Internship.created_at))
    result = await db.execute(stmt)
    items = result.scalars().all()

    # Get user profile for match score calculation
    p_stmt = select(Profile).where(Profile.user_id == user_id)
    p_res = await db.execute(p_stmt)
    profile = p_res.scalar_one_or_none()
    profile_dict = profile.__dict__ if profile else {}

    formatted_items = []
    for item in items:
        match_details = compute_match(
            profile=profile_dict,
            internship_required=item.required_skills or [],
            internship_preferred=item.preferred_skills or [],
            internship_location=item.location,
            internship_work_mode=item.work_mode,
            degree_req=item.degree_requirement
        )
        formatted_items.append(format_internship(item, is_saved=(item.id in saved_ids), match_details=match_details))

    # In-memory sorting for match_score or deadline if requested
    if sort in ("match_score", "match"):
        formatted_items.sort(key=lambda x: x.get("match_score") or 0, reverse=True)
    elif sort == "deadline":
        formatted_items.sort(key=lambda x: x.get("deadline") or "9999-99-99")

    # If page parameter is explicitly passed, return paginated envelope
    if page is not None:
        total = len(formatted_items)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_items = formatted_items[start:end]
        return {
            "items": paginated_items,
            "total": total,
            "page": page,
            "per_page": per_page
        }

    return formatted_items

@router.get("/recommended")
async def get_recommended_internships(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get top 10 recommended internships based on match score."""
    stmt = select(Internship).where(Internship.is_active == True)
    result = await db.execute(stmt)
    items = result.scalars().all()

    p_stmt = select(Profile).where(Profile.user_id == user_id)
    p_res = await db.execute(p_stmt)
    profile = p_res.scalar_one_or_none()
    profile_dict = profile.__dict__ if profile else {}

    saved_stmt = select(SavedInternship.internship_id).where(SavedInternship.user_id == user_id)
    saved_res = await db.execute(saved_stmt)
    saved_ids = set(saved_res.scalars().all())

    scored = []
    for item in items:
        match = compute_match(
            profile=profile_dict,
            internship_required=item.required_skills or [],
            internship_preferred=item.preferred_skills or [],
            internship_location=item.location,
            internship_work_mode=item.work_mode,
            degree_req=item.degree_requirement
        )
        scored.append(format_internship(item, is_saved=(item.id in saved_ids), match_details=match))

    scored.sort(key=lambda x: x.get("match_score") or 0, reverse=True)
    return scored[:10]

@router.get("/{id}")
async def get_internship_detail(
    id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve single internship with user match breakdown."""
    item = await db.get(Internship, id)
    if not item or not item.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship not found")

    saved_stmt = select(SavedInternship).where(
        SavedInternship.user_id == user_id,
        SavedInternship.internship_id == id
    )
    saved_res = await db.execute(saved_stmt)
    is_saved = saved_res.scalar_one_or_none() is not None

    p_stmt = select(Profile).where(Profile.user_id == user_id)
    p_res = await db.execute(p_stmt)
    profile = p_res.scalar_one_or_none()

    match = compute_match(
        profile=profile.__dict__ if profile else {},
        internship_required=item.required_skills or [],
        internship_preferred=item.preferred_skills or [],
        internship_location=item.location,
        internship_work_mode=item.work_mode,
        degree_req=item.degree_requirement
    )

    return format_internship(item, is_saved=is_saved, match_details=match)

@router.post("")
async def create_internship(
    payload: dict,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new internship opportunity."""
    item = Internship(
        company=payload.get("company") or payload.get("company_name", "Unknown"),
        title=payload.get("role") or payload.get("title", "Intern"),
        description=payload.get("description", ""),
        required_skills=payload.get("required_skills", []),
        preferred_skills=payload.get("preferred_skills", []),
        degree_requirement=payload.get("degree_requirement") or payload.get("eligibility"),
        location=payload.get("location"),
        work_mode=payload.get("work_mode", "Hybrid"),
        stipend_min=payload.get("stipend_min"),
        stipend_max=payload.get("stipend_max"),
        currency=payload.get("currency", "INR"),
        official_url=payload.get("job_url") or payload.get("official_url"),
        deadline=date.fromisoformat(payload["deadline"]) if payload.get("deadline") else None,
        source=payload.get("source", "manual"),
        is_demo=payload.get("is_demo", False),
        created_by=user_id
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return format_internship(item)

@router.patch("/{id}")
async def update_internship(
    id: str,
    payload: dict,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an existing internship."""
    item = await db.get(Internship, id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship not found")

    if "company" in payload:
        item.company = payload["company"]
    if "role" in payload or "title" in payload:
        item.title = payload.get("role") or payload.get("title")
    if "description" in payload:
        item.description = payload["description"]
    if "required_skills" in payload:
        item.required_skills = payload["required_skills"]
    if "preferred_skills" in payload:
        item.preferred_skills = payload["preferred_skills"]
    if "location" in payload:
        item.location = payload["location"]
    if "work_mode" in payload:
        item.work_mode = payload["work_mode"]
    if "job_url" in payload or "official_url" in payload:
        item.official_url = payload.get("job_url") or payload.get("official_url")
    if "deadline" in payload:
        item.deadline = date.fromisoformat(payload["deadline"]) if payload["deadline"] else None

    item.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(item)
    return format_internship(item)

@router.delete("/{id}")
async def delete_internship(
    id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Soft delete or remove internship."""
    item = await db.get(Internship, id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship not found")
    item.is_active = False
    await db.commit()
    return {"message": "Internship deleted successfully"}

@router.post("/{id}/save")
async def save_internship(
    id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Bookmark an internship for user."""
    stmt = select(SavedInternship).where(
        SavedInternship.user_id == user_id,
        SavedInternship.internship_id == id
    )
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()
    if not existing:
        saved = SavedInternship(user_id=user_id, internship_id=id)
        db.add(saved)
        await db.commit()
    return {"saved": True}

@router.delete("/{id}/save")
async def unsave_internship(
    id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove bookmark."""
    stmt = select(SavedInternship).where(
        SavedInternship.user_id == user_id,
        SavedInternship.internship_id == id
    )
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()
    if existing:
        await db.delete(existing)
        await db.commit()
    return {"saved": False}
