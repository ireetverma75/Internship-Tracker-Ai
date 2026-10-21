import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.db.models import Resume, Profile
from app.core.auth import get_current_user, DEMO_USER_ID
from app.services.resume_parser import parse_resume, validate_and_extract_text, ResumeParseError
from app.services.matching import compute_match
from app.schemas.profile import ExtractedProfile
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/resume", tags=["Resume"])

class ResumeMatchRequest(BaseModel):
    resume_text: str
    job_role: str
    job_company: Optional[str] = None
    required_skills: list[str] = []
    preferred_skills: list[str] = []
    job_description: Optional[str] = None

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload and parse PDF resume, saving structured profile."""
    content = await file.read()
    try:
        extracted = parse_resume(content, file.filename or "resume.pdf")
    except ResumeParseError as e:
        status_code = status.HTTP_422_UNPROCESSABLE_ENTITY if e.code == "SCANNED_PDF" else status.HTTP_400_BAD_REQUEST
        raise HTTPException(
            status_code=status_code,
            detail={"code": e.code, "message": e.message}
        )

    # Save resume record
    stmt = select(Resume).where(Resume.user_id == user_id)
    res = await db.execute(stmt)
    existing_resume = res.scalar_one_or_none()

    storage_dir = "uploads/resumes"
    os.makedirs(storage_dir, exist_ok=True)
    saved_filename = f"{user_id}_{int(datetime.utcnow().timestamp())}.pdf"
    storage_path = os.path.join(storage_dir, saved_filename)
    with open(storage_path, "wb") as f:
        f.write(content)

    if existing_resume:
        existing_resume.filename = file.filename or "resume.pdf"
        existing_resume.storage_path = storage_path
        existing_resume.file_size_bytes = len(content)
        existing_resume.parse_status = "parsed"
        existing_resume.parsed_at = datetime.utcnow()
        resume_id = existing_resume.id
    else:
        new_resume = Resume(
            user_id=user_id,
            filename=file.filename or "resume.pdf",
            storage_path=storage_path,
            file_size_bytes=len(content),
            parse_status="parsed",
            parsed_at=datetime.utcnow()
        )
        db.add(new_resume)
        resume_id = new_resume.id

    # Update Profile with extracted info
    p_stmt = select(Profile).where(Profile.user_id == user_id)
    p_res = await db.execute(p_stmt)
    profile = p_res.scalar_one_or_none()

    if not profile:
        profile = Profile(
            user_id=user_id,
            skills=extracted.skills,
            programming_languages=extracted.programming_languages,
            frameworks=extracted.frameworks,
            certifications=extracted.certifications,
            project_titles=extracted.project_titles,
            career_interests=extracted.career_interests,
            degree=extracted.degree,
            specialization=extracted.specialization,
            graduation_year=extracted.graduation_year,
        )
        db.add(profile)
    else:
        # Merge skills
        existing_skills = set(profile.skills or [])
        profile.skills = list(existing_skills.union(set(extracted.skills)))
        profile.programming_languages = list(set(profile.programming_languages or []).union(set(extracted.programming_languages)))
        profile.frameworks = list(set(profile.frameworks or []).union(set(extracted.frameworks)))
        if extracted.degree and not profile.degree:
            profile.degree = extracted.degree
        if extracted.graduation_year and not profile.graduation_year:
            profile.graduation_year = extracted.graduation_year

    await db.commit()

    return {
        "resume_id": resume_id,
        "parse_status": "parsed",
        "extracted_profile": extracted.model_dump(),
        "message": "Resume parsed successfully"
    }

@router.post("/parse")
async def parse_resume_endpoint(file: UploadFile = File(...)):
    """Parse resume PDF and return extracted content for UI preview."""
    content = await file.read()
    try:
        raw_text = validate_and_extract_text(content, file.filename or "resume.pdf")
        extracted = parse_resume(content, file.filename or "resume.pdf")
        words = raw_text.split()
        return {
            "filename": file.filename,
            "page_count": 1,
            "char_count": len(raw_text),
            "word_count": len(words),
            "extracted_text": raw_text,
            "detected_skills": extracted.skills,
            "extracted_profile": extracted.model_dump()
        }
    except ResumeParseError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message
        )

@router.post("/match")
async def match_resume_endpoint(payload: ResumeMatchRequest):
    """Calculate match score and details between resume text and job criteria."""
    # Build pseudo profile from text
    from app.services.resume_parser import _extract_profile
    extracted = _extract_profile(payload.resume_text)
    profile_dict = extracted.model_dump()

    match_result = compute_match(
        profile=profile_dict,
        internship_required=payload.required_skills,
        internship_preferred=payload.preferred_skills,
        internship_location=None,
        internship_work_mode="any",
        degree_req=None
    )

    return {
        "match_score": int(match_result.score),
        "fit_level": "Strong Fit" if match_result.score >= 80 else ("Moderate Fit" if match_result.score >= 50 else "Potential Growth Fit"),
        "matched_skills": match_result.matched_skills,
        "missing_skills": match_result.missing_skills,
        "strengths": [f"Demonstrated proficiency in {s}" for s in match_result.matched_skills[:3]],
        "gap_analysis": [f"Consider highlighting or building experience in {s}" for s in match_result.missing_skills[:3]],
        "recommendations": [
            "Tailor your project descriptions to emphasize required technical stack",
            "Include quantitative impact and metrics in your experience bullet points"
        ]
    }

@router.delete("")
async def delete_resume(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete current user's resume."""
    stmt = select(Resume).where(Resume.user_id == user_id)
    res = await db.execute(stmt)
    resume = res.scalar_one_or_none()
    if resume:
        if os.path.exists(resume.storage_path):
            try:
                os.remove(resume.storage_path)
            except OSError:
                pass
        await db.delete(resume)
        await db.commit()
    return {"message": "Resume deleted"}
