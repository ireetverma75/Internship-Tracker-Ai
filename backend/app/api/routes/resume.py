import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Request, status
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

@router.get("/me")
@router.get("/latest")
async def get_my_resume(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve the current user's active resume and parsed profile."""
    stmt = select(Resume).where(Resume.user_id == user_id).order_by(Resume.uploaded_at.desc())
    res = await db.execute(stmt)
    resume = res.scalar_one_or_none()

    p_stmt = select(Profile).where(Profile.user_id == user_id)
    p_res = await db.execute(p_stmt)
    profile = p_res.scalar_one_or_none()

    if not resume:
        return {
            "has_resume": False,
            "resume": None,
            "skills": profile.skills if profile else []
        }

    return {
        "has_resume": True,
        "resume": {
            "id": resume.id,
            "user_id": resume.user_id,
            "filename": resume.filename,
            "file_size_bytes": resume.file_size_bytes,
            "parse_status": resume.parse_status,
            "uploaded_at": resume.uploaded_at.isoformat() if resume.uploaded_at else None,
            "parsed_at": resume.parsed_at.isoformat() if resume.parsed_at else None,
        },
        "skills": profile.skills if profile else []
    }

@router.get("/{resume_id}")
async def get_resume_by_id(
    resume_id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve resume metadata by resume ID."""
    if resume_id in ["me", "latest"]:
        return await get_my_resume(user_id=user_id, db=db)

    stmt = select(Resume).where(Resume.id == resume_id)
    res = await db.execute(stmt)
    resume = res.scalar_one_or_none()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID '{resume_id}' not found."
        )

    # Authorization check
    if resume.user_id != user_id and user_id != DEMO_USER_ID:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this resume."
        )

    return {
        "id": resume.id,
        "user_id": resume.user_id,
        "filename": resume.filename,
        "file_size_bytes": resume.file_size_bytes,
        "parse_status": resume.parse_status,
        "uploaded_at": resume.uploaded_at.isoformat() if resume.uploaded_at else None,
        "parsed_at": resume.parsed_at.isoformat() if resume.parsed_at else None,
    }

@router.post("/analyze")
async def analyze_resume_endpoint(
    request: Request,
    file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None)
):
    """Analyze a resume (file or raw text) and return structured ATS analysis with quality metrics."""
    raw_text = ""
    filename = "resume.pdf"

    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body = await request.json()
            resume_text = body.get("resume_text", resume_text)
        except Exception:
            pass

    if file:
        content = await file.read()
        filename = file.filename or "resume.pdf"
        try:
            raw_text = validate_and_extract_text(content, filename)
            extracted = parse_resume(content, filename)
        except ResumeParseError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
    elif resume_text and resume_text.strip():
        raw_text = resume_text.strip()
        from app.services.resume_parser import _extract_profile
        extracted = _extract_profile(raw_text)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a PDF resume file or 'resume_text' must be provided."
        )

    words = raw_text.split()
    skills = extracted.skills or []
    text_lower = raw_text.lower()

    action_verbs = ["spearheaded", "developed", "architected", "engineered", "implemented", "reduced", "optimized", "built", "designed", "deployed"]
    detected_verbs = [v for v in action_verbs if v in text_lower]
    impact_score = min(100, 50 + len(detected_verbs) * 10)
    skill_score = min(100, round((len(skills) / 12) * 100))
    structure_score = 90 if "education" in text_lower and ("experience" in text_lower or "project" in text_lower) else 70
    conciseness_score = 95 if 250 <= len(words) <= 650 else (60 if len(words) < 250 else 75)
    overall_quality = round(impact_score * 0.3 + skill_score * 0.3 + structure_score * 0.2 + conciseness_score * 0.2)

    suggestions = []
    if len(skills) < 8:
        suggestions.append("Incorporate specific technical stack keywords (e.g. Docker, SQL, TypeScript) to pass ATS screening.")
    if len(detected_verbs) < 3:
        suggestions.append("Begin bullet points with high-impact action verbs (e.g., 'Engineered', 'Architected', 'Accelerated').")
    if not any(char in text_lower for char in ["%", "$", "reduced", "increased"]):
        suggestions.append("Quantify project outcomes with numerical metrics (e.g. 'boosted performance by 28%').")
    if len(words) > 700:
        suggestions.append("Resume length is slightly verbose. Consider condensing to a high-impact single page.")
    if not suggestions:
        suggestions.append("Resume demonstrates strong technical depth, clear visual sections, and action-oriented achievements.")

    return {
        "filename": filename,
        "page_count": 1,
        "char_count": len(raw_text),
        "word_count": len(words),
        "extracted_text": raw_text,
        "detected_skills": skills,
        "quality_score": overall_quality,
        "quality_breakdown": {
            "impact": impact_score,
            "skills_density": skill_score,
            "structure": structure_score,
            "conciseness": conciseness_score
        },
        "extracted_profile": extracted.model_dump(),
        "suggestions": suggestions
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

    resume_text_lower = payload.resume_text.lower()
    matched_req = [s for s in payload.required_skills if s.lower() in resume_text_lower]
    missing_req = [s for s in payload.required_skills if s.lower() not in resume_text_lower]
    pref_found = [s for s in payload.preferred_skills if s.lower() in resume_text_lower]

    # Snippets for evidence
    sentences = [s.strip() for s in payload.resume_text.split("\n") if len(s.strip()) > 20]
    evidence = [s for s in sentences if any(skill.lower() in s.lower() for skill in matched_req)][:3]
    if not evidence:
        evidence = ["Demonstrated engineering projects and relevant technical coursework highlighted on resume."]

    suggestions = [
        f"Highlight hands-on project experience with missing requirements: {', '.join(missing_req[:3])}." if missing_req else "Add quantifiable metrics to existing project bullet points.",
        "Ensure technical skills are explicitly listed in both a dedicated skills section and contextual project descriptions.",
        "Include direct links to live GitHub repositories or deployed demo URLs."
    ]

    has_degree = any(d in resume_text_lower for d in ["b.tech", "b.e", "bachelor", "master", "computer science"])

    return {
        "match_score": int(match_result.score),
        "fit_level": "Strong Fit" if match_result.score >= 80 else ("Moderate Fit" if match_result.score >= 50 else "Potential Growth Fit"),
        "matched_required_skills": matched_req,
        "missing_required_skills": missing_req,
        "matched_skills": match_result.matched_skills,
        "missing_skills": match_result.missing_skills,
        "preferred_skills_found": pref_found,
        "relevant_experience_evidence": evidence,
        "education_observations": [
            "Target STEM university degree in progress observed." if has_degree else "Explicit degree credentials could not be definitively extracted."
        ],
        "resume_improvement_suggestions": suggestions,
        "recommended_skills_to_learn": missing_req[:4],
        "scoring_explanation": "Score computed using transparent deterministic weights (40% required skills, 20% preferred skills, 20% education, 15% projects, 5% location).",
        "is_demo": True,
        "model_used": "deterministic-backend-matcher",
        "strengths": [f"Demonstrated proficiency in {s}" for s in match_result.matched_skills[:3]],
        "gap_analysis": [f"Consider highlighting or building experience in {s}" for s in match_result.missing_skills[:3]],
        "recommendations": suggestions
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
