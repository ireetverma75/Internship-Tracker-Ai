from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from pydantic import BaseModel

from app.db.database import get_db
from app.db.models import Profile
from app.core.auth import get_current_user
from app.services.ai_analyzer import analyze_job_description
from app.services.matching import compute_match

router = APIRouter(tags=["Analysis"])

class JobAnalyzeRequest(BaseModel):
    description: Optional[str] = None
    text: Optional[str] = None
    job_url: Optional[str] = None

@router.post("/api/analyze-job")
@router.post("/api/analyze/job-description")
async def analyze_job(
    payload: JobAnalyzeRequest,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Analyze a pasted job description using AI (or fallback demo analyzer)."""
    raw_text = payload.description or payload.text
    if not raw_text or len(raw_text.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description text is too short or empty."
        )

    extracted, is_demo = await analyze_job_description(raw_text)

    # Get user profile for match preview
    p_stmt = select(Profile).where(Profile.user_id == user_id)
    p_res = await db.execute(p_stmt)
    profile = p_res.scalar_one_or_none()
    profile_dict = profile.__dict__ if profile else {}

    match = compute_match(
        profile=profile_dict,
        internship_required=extracted.required_skills,
        internship_preferred=extracted.preferred_skills,
        internship_location=extracted.location,
        internship_work_mode=extracted.work_mode or "any",
        degree_req=extracted.eligibility
    )

    all_tech = list(dict.fromkeys(extracted.required_skills + extracted.preferred_skills))

    return {
        "role": extracted.title or "Software Engineering Intern",
        "title": extracted.title or "Software Engineering Intern",
        "company": extracted.company or "[Demo Company]",
        "experience_requirement": "Entry Level / College Student",
        "eligibility_criteria": extracted.eligibility or "Enrolled in B.Tech, B.E., or related degree",
        "required_skills": extracted.required_skills,
        "preferred_skills": extracted.preferred_skills,
        "responsibilities": extracted.responsibilities or [
            "Contribute to software design and architecture",
            "Write robust unit tests and documentation",
            "Collaborate with engineering teams"
        ],
        "location": extracted.location or "Bangalore, India",
        "work_mode": extracted.work_mode or "Hybrid",
        "stipend_or_salary": extracted.compensation or "₹30,000 – ₹50,000/month",
        "application_deadline": extracted.deadline,
        "important_qualifications": [
            "Strong grasp of data structures and algorithms",
            "Familiarity with Git and collaborative version control"
        ],
        "key_technologies": all_tech if all_tech else ["Python", "SQL", "Git"],
        "interview_prep_tips": [
            "Review core data structure problems on LeetCode / GeeksforGeeks",
            "Be ready to explain architectural choices made in your project portfolio",
            "Practice explaining time/space complexities clearly"
        ],
        "role_summary": f"Exciting opportunity at {extracted.company or 'leading tech team'} focused on scalable engineering and modern tech stacks.",
        "is_demo": is_demo,
        "extracted": extracted.model_dump(),
        "match_preview": {
            "score": int(match.score),
            "matched_skills": match.matched_skills,
            "missing_skills": match.missing_skills
        }
    }
