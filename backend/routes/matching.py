"""
Resume Matching API Router.
Calculates actual TF-IDF Cosine Similarity, Skill Gap, and Recommendations.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.db.models import Job
from app.schemas.job import (
    JobMatchResult,
    ResumeMatchResponse,
    BatchMatchResponse,
)
from ml.resume_parser import extract_text_from_pdf, MLResumeParseError
from ml.job_matcher import match_resume_to_job
from ml.skill_extractor import extract_skills_from_text

router = APIRouter(prefix="/api/matching", tags=["Matching"])

@router.post("/match-job", response_model=ResumeMatchResponse)
async def match_resume_with_job(
    job_id: str = Form(...),
    file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Match an uploaded PDF resume or raw resume text against a specific job from the dataset.
    Uses TF-IDF, Cosine Similarity, and skill gap analysis to compute genuine match metrics.
    """
    # 1. Fetch Job
    job_stmt = select(Job).where(Job.id == job_id)
    job_res = await db.execute(job_stmt)
    job = job_res.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID '{job_id}' not found."
        )

    # 2. Extract Resume Text
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
            detail="Either a PDF file or 'resume_text' must be provided."
        )

    job_dict = {
        "id": job.id,
        "job_title": job.job_title,
        "company": job.company,
        "job_type": job.job_type,
        "description": job.description,
        "qualifications": job.qualifications,
        "duties": job.duties,
        "pay": job.pay,
        "is_synthetic": job.is_synthetic,
    }

    match_result_dict = match_resume_to_job(text_to_analyze, job_dict)
    candidate_skills = match_result_dict.pop("candidate_skills", [])

    return ResumeMatchResponse(
        extracted_candidate_skills=candidate_skills,
        total_skills_detected=len(candidate_skills),
        match_result=JobMatchResult(**match_result_dict)
    )

@router.post("/match-text", response_model=JobMatchResult)
async def match_resume_text_direct(
    resume_text: str = Body(..., embed=True),
    job_title: str = Body("Target Position", embed=True),
    company: str = Body("Target Company", embed=True),
    job_description: str = Body(..., embed=True),
    qualifications: Optional[str] = Body("", embed=True),
    duties: Optional[str] = Body("", embed=True)
):
    """
    Match candidate resume text directly against an arbitrary job description without saving to DB.
    """
    if not resume_text.strip() or not job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both resume_text and job_description must be non-empty."
        )

    job_dict = {
        "id": "ad-hoc",
        "job_title": job_title,
        "company": company,
        "job_type": "Direct Analysis",
        "description": job_description,
        "qualifications": qualifications or "",
        "duties": duties or "",
        "pay": None,
        "is_synthetic": False
    }

    res = match_resume_to_job(resume_text, job_dict)
    res.pop("candidate_skills", None)
    return JobMatchResult(**res)

@router.post("/batch-match", response_model=BatchMatchResponse)
async def batch_match_resume(
    file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    limit: int = Form(10),
    include_synthetic: bool = Form(False),
    db: AsyncSession = Depends(get_db)
):
    """
    Compare resume against all jobs in the database and return ranked results.
    """
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
            detail="Either a PDF file or 'resume_text' must be provided."
        )

    stmt = select(Job)
    if not include_synthetic:
        stmt = stmt.where(Job.is_synthetic == False)
    stmt = stmt.limit(100)  # evaluate top 100 for responsive latency

    res = await db.execute(stmt)
    jobs = res.scalars().all()

    cand_skills = extract_skills_from_text(text_to_analyze)
    results = []

    for j in jobs:
        j_dict = {
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
        m = match_resume_to_job(text_to_analyze, j_dict)
        m.pop("candidate_skills", None)
        results.append(JobMatchResult(**m))

    results.sort(key=lambda x: x.match_score, reverse=True)

    return BatchMatchResponse(
        total_evaluated=len(results),
        extracted_candidate_skills=cand_skills,
        matches=results[:limit]
    )

@router.post("/analyze")
async def analyze_matching_endpoint(
    job_id: Optional[str] = Form(None),
    job_description: Optional[str] = Form(None),
    job_title: Optional[str] = Form("Target Position"),
    company: Optional[str] = Form("Target Company"),
    required_skills: Optional[str] = Form(None),
    preferred_skills: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """General matching analysis endpoint supporting job_id or freeform job description."""
    if job_id:
        return await match_resume_with_job(job_id=job_id, file=file, resume_text=resume_text, db=db)

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

    desc = job_description or ""
    if required_skills:
        desc += f"\nRequired Skills: {required_skills}"
    if preferred_skills:
        desc += f"\nPreferred Skills: {preferred_skills}"

    result = match_resume_to_job(text_to_analyze, {
        "id": "ad-hoc",
        "job_title": job_title,
        "company": company,
        "job_type": "Ad-Hoc",
        "description": desc,
        "qualifications": required_skills or "",
        "duties": "",
        "pay": None,
        "is_synthetic": False
    })
    cand_skills = result.pop("candidate_skills", [])
    return ResumeMatchResponse(
        extracted_candidate_skills=cand_skills,
        total_skills_detected=len(cand_skills),
        match_result=JobMatchResult(**result)
    )
