"""
Recommendations API Router.
Recommends jobs from the Hugging Face dataset based on candidate resume credentials.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.db.models import Job, Profile
from app.core.auth import get_current_user
from app.schemas.job import (
    JobMatchResult,
    RecommendationResponse,
)
from ml.resume_parser import extract_text_from_pdf, MLResumeParseError
from ml.recommendation import recommend_jobs_for_resume

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

@router.post("/jobs", response_model=RecommendationResponse)
async def get_job_recommendations_from_resume(
    request: Request,
    file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    top_n: int = Form(10),
    job_type: Optional[str] = Form(None),
    include_synthetic: bool = Form(False),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate personalized job recommendations from the Hugging Face dataset
    for an uploaded candidate resume.
    """
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body = await request.json()
            resume_text = body.get("resume_text", resume_text)
            top_n = body.get("top_n", top_n)
            job_type = body.get("job_type", job_type)
            include_synthetic = body.get("include_synthetic", include_synthetic)
        except Exception:
            pass
    text_to_analyze = ""
    if file:
        file_bytes = await file.read()
        try:
            text_to_analyze = extract_text_from_pdf(file_bytes, filename=file.filename or "resume.pdf")
        except MLResumeParseError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
    elif resume_text and resume_text.strip():
        text_to_analyze = resume_text.strip()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a PDF resume file or 'resume_text' must be provided."
        )

    # Fetch candidate jobs
    stmt = select(Job)
    if not include_synthetic:
        stmt = stmt.where(Job.is_synthetic == False)

    res = await db.execute(stmt)
    jobs_db = res.scalars().all()

    jobs_list = [
        {
            "id": j.id,
            "job_title": j.job_title,
            "company": j.company,
            "job_type": j.job_type,
            "description": j.description,
            "qualifications": j.qualifications,
            "duties": j.duties,
            "pay": j.pay,
            "is_synthetic": j.is_synthetic,
        }
        for j in jobs_db
    ]

    rec_data = recommend_jobs_for_resume(
        resume_text=text_to_analyze,
        jobs=jobs_list,
        top_n=top_n,
        job_type_filter=job_type,
        include_synthetic=include_synthetic
    )

    formatted_recs = []
    for item in rec_data["recommendations"]:
        item_copy = dict(item)
        item_copy.pop("candidate_skills", None)
        formatted_recs.append(JobMatchResult(**item_copy))

    return RecommendationResponse(
        total_recommendations=len(formatted_recs),
        extracted_candidate_skills=rec_data["extracted_candidate_skills"],
        recommendations=formatted_recs
    )

@router.get("", response_model=RecommendationResponse)
@router.get("/profile-based", response_model=RecommendationResponse)
async def get_profile_based_recommendations(
    top_n: int = Query(8, ge=1, le=20),
    include_synthetic: bool = Query(False),
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Recommend jobs using the saved student profile skills and career preferences.
    """
    prof_stmt = select(Profile).where(Profile.user_id == user_id)
    prof_res = await db.execute(prof_stmt)
    profile = prof_res.scalar_one_or_none()

    if not profile or not profile.skills:
        # Fallback pseudo-resume for demo user if profile is sparse
        resume_text = "Software Engineer with experience in Python, SQL, REST APIs, Git, Machine Learning, and Cloud technologies."
    else:
        skills_str = ", ".join(profile.skills)
        langs_str = ", ".join(profile.programming_languages or [])
        frames_str = ", ".join(profile.frameworks or [])
        degree_str = profile.degree or "Computer Science"
        resume_text = f"Degree: {degree_str}\nSkills: {skills_str}, {langs_str}, {frames_str}\nCareer Goals: {profile.career_interests or ''}"

    stmt = select(Job)
    if not include_synthetic:
        stmt = stmt.where(Job.is_synthetic == False)

    res = await db.execute(stmt)
    jobs_db = res.scalars().all()

    jobs_list = [
        {
            "id": j.id,
            "job_title": j.job_title,
            "company": j.company,
            "job_type": j.job_type,
            "description": j.description,
            "qualifications": j.qualifications,
            "duties": j.duties,
            "pay": j.pay,
            "is_synthetic": j.is_synthetic,
        }
        for j in jobs_db
    ]

    rec_data = recommend_jobs_for_resume(
        resume_text=resume_text,
        jobs=jobs_list,
        top_n=top_n,
        include_synthetic=include_synthetic
    )

    formatted_recs = []
    for item in rec_data["recommendations"]:
        item_copy = dict(item)
        item_copy.pop("candidate_skills", None)
        formatted_recs.append(JobMatchResult(**item_copy))

    return RecommendationResponse(
        total_recommendations=len(formatted_recs),
        extracted_candidate_skills=rec_data["extracted_candidate_skills"],
        recommendations=formatted_recs
    )
