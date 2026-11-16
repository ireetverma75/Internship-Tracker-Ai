from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from typing import Optional
from datetime import datetime, date

from app.db.database import get_db
from app.db.models import Application, Internship
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/applications", tags=["Applications"])

STATUS_MAP = {
    "saved": "Saved",
    "applied": "Applied",
    "assessment": "Assessment",
    "interview": "Interview",
    "selected": "Selected",
    "rejected": "Rejected"
}

def format_application(app: Application) -> dict:
    normalized_status = STATUS_MAP.get(app.status.lower(), app.status.capitalize())
    return {
        "id": app.id,
        "internship_id": app.internship_id,
        "company": app.company_name,
        "company_name": app.company_name,
        "role": app.role_title,
        "role_title": app.role_title,
        "status": normalized_status,
        "applied_date": app.applied_date.isoformat() if app.applied_date else None,
        "interview_date": app.interview_date.isoformat() if app.interview_date else None,
        "deadline": app.deadline.isoformat() if app.deadline else None,
        "notes": app.notes,
        "job_url": app.external_url,
        "external_url": app.external_url,
        "match_score": 85,
        "created_at": app.created_at.isoformat() if app.created_at else None,
        "updated_at": app.updated_at.isoformat() if app.updated_at else None,
    }

@router.get("")
async def list_applications(
    status: Optional[str] = None,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List applications for authenticated user."""
    stmt = select(Application).where(Application.user_id == user_id)
    if status and status.lower() != "all":
        stmt = stmt.where(Application.status.ilike(status))
    stmt = stmt.order_by(desc(Application.updated_at))

    res = await db.execute(stmt)
    apps = res.scalars().all()
    return [format_application(a) for a in apps]

@router.post("")
async def create_application(
    payload: dict,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new job/internship application record."""
    status_val = payload.get("status", "Saved")
    app = Application(
        user_id=user_id,
        internship_id=payload.get("internship_id"),
        company_name=payload.get("company") or payload.get("company_name", "Unknown"),
        role_title=payload.get("role") or payload.get("role_title", "Intern"),
        status=status_val.lower(),
        applied_date=date.fromisoformat(payload["applied_date"]) if payload.get("applied_date") else (date.today() if status_val.lower() == "applied" else None),
        interview_date=date.fromisoformat(payload["interview_date"]) if payload.get("interview_date") else None,
        deadline=date.fromisoformat(payload["deadline"]) if payload.get("deadline") else None,
        notes=payload.get("notes"),
        external_url=payload.get("job_url") or payload.get("external_url")
    )
    db.add(app)
    await db.commit()
    await db.refresh(app)
    return format_application(app)

@router.get("/metrics")
@router.get("/stats")
async def get_metrics(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Dashboard aggregate counts for applications and user metrics."""
    from app.db.models import SavedInternship, Job
    from sqlalchemy import func

    stmt = select(Application).where(Application.user_id == user_id)
    res = await db.execute(stmt)
    apps = res.scalars().all()

    counts = {
        "saved": 0,
        "applied": 0,
        "assessment": 0,
        "interview": 0,
        "selected": 0,
        "rejected": 0,
        "total": len(apps)
    }
    for a in apps:
        k = a.status.lower()
        if k in counts:
            counts[k] += 1

    # Count saved internships
    saved_stmt = select(func.count(SavedInternship.id)).where(SavedInternship.user_id == user_id)
    saved_cnt = (await db.execute(saved_stmt)).scalar() or 0

    # Count jobs from dataset
    job_cnt_stmt = select(func.count(Job.id))
    total_jobs = (await db.execute(job_cnt_stmt)).scalar() or 0

    # Count upcoming deadlines in next 30 days
    today = date.today()
    upcoming_deadlines = 0
    for a in apps:
        if a.deadline and today <= a.deadline <= date.fromordinal(today.toordinal() + 30):
            upcoming_deadlines += 1

    return {
        **counts,
        "savedInternshipsCount": saved_cnt,
        "applicationsSubmittedCount": counts["applied"] + counts["assessment"] + counts["interview"] + counts["selected"] + counts["rejected"],
        "interviewsScheduledCount": counts["interview"],
        "upcomingDeadlinesCount": upcoming_deadlines,
        "statusCounts": {
            "Saved": counts["saved"],
            "Applied": counts["applied"],
            "Assessment": counts["assessment"],
            "Interview": counts["interview"],
            "Selected": counts["selected"],
            "Rejected": counts["rejected"]
        },
        "averageMatchScore": 85,
        "totalJobsCount": total_jobs
    }

@router.get("/{id}")
async def get_application(
    id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve application by ID."""
    app = await db.get(Application, id)
    if not app or app.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return format_application(app)

@router.patch("/{id}")
async def update_application(
    id: str,
    payload: dict,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update application attributes."""
    app = await db.get(Application, id)
    if not app or app.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if "company" in payload or "company_name" in payload:
        app.company_name = payload.get("company") or payload.get("company_name")
    if "role" in payload or "role_title" in payload:
        app.role_title = payload.get("role") or payload.get("role_title")
    if "status" in payload:
        app.status = payload["status"].lower()
    if "applied_date" in payload:
        app.applied_date = date.fromisoformat(payload["applied_date"]) if payload["applied_date"] else None
    if "interview_date" in payload:
        app.interview_date = date.fromisoformat(payload["interview_date"]) if payload["interview_date"] else None
    if "deadline" in payload:
        app.deadline = date.fromisoformat(payload["deadline"]) if payload["deadline"] else None
    if "notes" in payload:
        app.notes = payload["notes"]
    if "job_url" in payload or "external_url" in payload:
        app.external_url = payload.get("job_url") or payload.get("external_url")

    app.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(app)
    return format_application(app)

@router.delete("/{id}")
async def delete_application(
    id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete an application."""
    app = await db.get(Application, id)
    if not app or app.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    await db.delete(app)
    await db.commit()
    return {"message": "Application deleted"}
