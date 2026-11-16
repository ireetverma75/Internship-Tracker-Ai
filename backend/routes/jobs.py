"""
Jobs API Router.
Provides retrieval, search, filtering, and dataset synchronization for Hugging Face jobs.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, distinct

from app.db.database import get_db
from app.db.models import Job
from app.schemas.job import (
    JobResponse,
    JobListResponse,
    DatasetSyncResponse,
)
from pydantic import BaseModel
from app.core.auth import get_current_user
from dataset.database_sync import sync_dataset_to_db
from ml.skill_extractor import extract_skills_from_job

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

class JobSavePayload(BaseModel):
    job_id: str

@router.get("", response_model=JobListResponse)
@router.get("/search", response_model=JobListResponse)
async def list_jobs(
    query: Optional[str] = Query(None, description="General search keyword for title, company, description"),
    job_title: Optional[str] = Query(None, description="Filter by job title"),
    company: Optional[str] = Query(None, description="Filter by company"),
    job_type: Optional[str] = Query(None, description="Filter by job type / category"),
    skill: Optional[str] = Query(None, description="Filter jobs requiring this skill"),
    is_synthetic: Optional[bool] = Query(None, description="Filter by synthetic status (True/False)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db)
):
    """
    Search and filter jobs loaded from the Hugging Face Jobs Tabular Dataset.
    """
    stmt = select(Job)

    # Filtering
    if query:
        q_term = f"%{query.strip()}%"
        stmt = stmt.where(
            or_(
                Job.job_title.ilike(q_term),
                Job.company.ilike(q_term),
                Job.description.ilike(q_term),
                Job.qualifications.ilike(q_term),
                Job.duties.ilike(q_term),
            )
        )

    if job_title:
        stmt = stmt.where(Job.job_title.ilike(f"%{job_title.strip()}%"))

    if company:
        stmt = stmt.where(Job.company.ilike(f"%{company.strip()}%"))

    if job_type and job_type.lower() != "all":
        stmt = stmt.where(Job.job_type.ilike(f"%{job_type.strip()}%"))

    if skill:
        skill_term = f"%{skill.strip()}%"
        stmt = stmt.where(
            or_(
                Job.description.ilike(skill_term),
                Job.qualifications.ilike(skill_term),
                Job.duties.ilike(skill_term),
            )
        )

    if is_synthetic is not None:
        stmt = stmt.where(Job.is_synthetic == is_synthetic)

    # Count total matching rows
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_count = (await db.execute(count_stmt)).scalar() or 0

    # Pagination & Ordering: real-world listings (is_synthetic=False) first by default, then title
    stmt = stmt.order_by(Job.is_synthetic.asc(), Job.job_title.asc())
    stmt = stmt.offset((page - 1) * limit).limit(limit)

    result = await db.execute(stmt)
    db_jobs = result.scalars().all()

    # Enrich jobs with extracted skills
    job_responses: List[JobResponse] = []
    for j in db_jobs:
        skills = extract_skills_from_job(
            description=j.description or "",
            qualifications=j.qualifications or "",
            duties=j.duties or ""
        )
        job_responses.append(
            JobResponse(
                id=j.id,
                job_title=j.job_title,
                company=j.company,
                job_type=j.job_type,
                description=j.description,
                qualifications=j.qualifications,
                duties=j.duties,
                pay=j.pay,
                source=j.source,
                is_synthetic=j.is_synthetic,
                created_at=j.created_at,
                skills=skills
            )
        )

    # Fetch available unique job types for UI dropdowns
    type_stmt = select(distinct(Job.job_type)).where(Job.job_type.isnot(None)).order_by(Job.job_type)
    type_res = await db.execute(type_stmt)
    job_types = [t[0] for t in type_res.all() if t[0]]

    # Fetch top companies for UI dropdowns
    comp_stmt = select(Job.company, func.count(Job.id).label("c")).group_by(Job.company).order_by(func.count(Job.id).desc()).limit(20)
    comp_res = await db.execute(comp_stmt)
    top_companies = [c[0] for c in comp_res.all() if c[0]]

    total_pages = max(1, (total_count + limit - 1) // limit)

    return JobListResponse(
        total=total_count,
        page=page,
        limit=limit,
        total_pages=total_pages,
        jobs=job_responses,
        job_types=job_types,
        companies=top_companies
    )

@router.get("/stats")
async def get_job_stats(db: AsyncSession = Depends(get_db)):
    """Return dataset analytics: original count, synthetic count, top job types."""
    total_q = await db.execute(select(func.count(Job.id)))
    total = total_q.scalar() or 0

    orig_q = await db.execute(select(func.count(Job.id)).where(Job.is_synthetic == False))
    orig_count = orig_q.scalar() or 0

    synth_q = await db.execute(select(func.count(Job.id)).where(Job.is_synthetic == True))
    synth_count = synth_q.scalar() or 0

    top_types_q = await db.execute(
        select(Job.job_type, func.count(Job.id))
        .group_by(Job.job_type)
        .order_by(func.count(Job.id).desc())
        .limit(10)
    )
    top_types = [{"job_type": row[0], "count": row[1]} for row in top_types_q.all() if row[0]]

    return {
        "total_jobs": total,
        "original_real_world_jobs": orig_count,
        "augmented_synthetic_jobs": synth_count,
        "top_categories": top_types,
        "source": "priyaagarwal19/Jobs-tabular-dataset"
    }

@router.post("/save")
@router.post("/{job_id}/save")
async def save_job_endpoint(
    job_id: Optional[str] = None,
    payload: Optional[JobSavePayload] = None,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    target_id = job_id or (payload.job_id if payload else None)
    if not target_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="job_id is required")

    job = (await db.execute(select(Job).where(Job.id == target_id))).scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    from app.db.models import SavedInternship
    existing = (await db.execute(select(SavedInternship).where(SavedInternship.user_id == user_id, SavedInternship.internship_id == target_id))).scalar_one_or_none()
    if not existing:
        saved = SavedInternship(user_id=user_id, internship_id=target_id)
        db.add(saved)
        await db.commit()
    return {"message": "Job saved successfully", "job_id": target_id, "is_saved": True}

@router.delete("/save/{job_id}")
@router.delete("/{job_id}/save")
async def unsave_job_endpoint(
    job_id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.db.models import SavedInternship
    existing = (await db.execute(select(SavedInternship).where(SavedInternship.user_id == user_id, SavedInternship.internship_id == job_id))).scalar_one_or_none()
    if existing:
        await db.delete(existing)
        await db.commit()
    return {"message": "Job unsaved successfully", "job_id": job_id, "is_saved": False}

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve full details of a specific job by its ID."""
    stmt = select(Job).where(Job.id == job_id)
    result = await db.execute(stmt)
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID '{job_id}' not found."
        )

    skills = extract_skills_from_job(
        description=job.description or "",
        qualifications=job.qualifications or "",
        duties=job.duties or ""
    )

    return JobResponse(
        id=job.id,
        job_title=job.job_title,
        company=job.company,
        job_type=job.job_type,
        description=job.description,
        qualifications=job.qualifications,
        duties=job.duties,
        pay=job.pay,
        source=job.source,
        is_synthetic=job.is_synthetic,
        created_at=job.created_at,
        skills=skills
    )

@router.post("/sync", response_model=DatasetSyncResponse)
async def sync_jobs_endpoint(
    split: str = Query("original", description="Split to sync ('original', 'augmented', or 'all')"),
    max_records: Optional[int] = Query(None, description="Optional cap on records to load"),
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger synchronization of the Hugging Face tabular dataset into the database.
    """
    if split not in ["original", "augmented", "all"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Split must be 'original', 'augmented', or 'all'."
        )

    try:
        sync_result = await sync_dataset_to_db(session=db, split=split, max_records=max_records)
        return DatasetSyncResponse(**sync_result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dataset sync failed: {str(e)}"
        )
