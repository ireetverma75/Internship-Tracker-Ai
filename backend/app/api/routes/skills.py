"""
Skill Gap Analysis API Router.
Calculates technical skill alignment, missing skills, and personalized learning pathways.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.db.models import Profile, Job
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/skills", tags=["Skills"])

BENCHMARK_ROLES: dict[str, dict] = {
    "swe-intern": {
        "role": "Full-Stack Software Engineer",
        "description": "Modern web applications, scalable backend REST APIs, relational databases, and clean code principles.",
        "target_skills": ["Python", "TypeScript", "React", "Next.js", "Node.js", "SQL", "PostgreSQL", "Docker", "Git", "REST APIs", "FastAPI", "Tailwind CSS"]
    },
    "ai-ml-intern": {
        "role": "AI & Machine Learning Engineer",
        "description": "Deep learning models, natural language processing, vector search, PyTorch pipelines, and ML serving.",
        "target_skills": ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "Pandas", "NumPy", "Hugging Face", "NLP", "SQL", "Docker", "FastAPI"]
    },
    "cloud-devops": {
        "role": "Cloud & DevOps Specialist",
        "description": "Containerization, infrastructure as code, CI/CD pipelines, automated testing, and scalable microservices.",
        "target_skills": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Git", "Python", "Terraform", "PostgreSQL", "Bash"]
    },
    "data-engineer": {
        "role": "Data Platform & Analytics Engineer",
        "description": "ETL pipelines, data warehousing, stream processing, distributed computing, and schema design.",
        "target_skills": ["Python", "SQL", "Apache Spark", "Pandas", "PostgreSQL", "Kafka", "Docker", "Git", "Data Modeling"]
    }
}

class SkillGapRequest(BaseModel):
    role_key: Optional[str] = "swe-intern"
    target_role: Optional[str] = None
    target_skills: Optional[List[str]] = None
    candidate_skills: Optional[List[str]] = None

@router.get("/gap-analysis")
async def get_skill_gap_analysis(
    role: str = Query("swe-intern", description="Benchmark role key or target position"),
    skills: Optional[str] = Query(None, description="Comma-separated candidate skills"),
    job_id: Optional[str] = Query(None, description="Optional dataset job ID to evaluate against"),
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Perform skill gap analysis between candidate skills and a benchmark role or job listing.
    """
    # 1. Determine candidate skills
    candidate_skills_list: List[str] = []
    if skills:
        candidate_skills_list = [s.strip() for s in skills.split(",") if s.strip()]
    else:
        # Load from Profile
        p_stmt = select(Profile).where(Profile.user_id == user_id)
        p_res = await db.execute(p_stmt)
        profile = p_res.scalar_one_or_none()
        if profile and profile.skills:
            candidate_skills_list = profile.skills
        else:
            candidate_skills_list = ["Python", "React", "TypeScript", "SQL", "Git", "FastAPI", "Tailwind CSS"]

    # 2. Determine target requirements
    target_role_title = "Full-Stack Software Engineer"
    target_role_desc = ""
    target_skills: List[str] = []

    if job_id:
        job = (await db.execute(select(Job).where(Job.id == job_id))).scalar_one_or_none()
        if job:
            from ml.skill_extractor import extract_skills_from_job
            target_role_title = f"{job.job_title} at {job.company}"
            target_role_desc = job.description or ""
            target_skills = extract_skills_from_job(job.description or "", job.qualifications or "", job.duties or "")

    if not target_skills:
        role_key = role.lower().strip()
        matched_benchmark = BENCHMARK_ROLES.get(role_key)
        if not matched_benchmark:
            # Match by substring or default
            for k, v in BENCHMARK_ROLES.items():
                if role_key in k or role_key in v["role"].lower():
                    matched_benchmark = v
                    break
        if not matched_benchmark:
            matched_benchmark = BENCHMARK_ROLES["swe-intern"]

        target_role_title = matched_benchmark["role"]
        target_role_desc = matched_benchmark["description"]
        target_skills = matched_benchmark["target_skills"]

    cand_set = {s.lower() for s in candidate_skills_list}
    matched = [s for s in target_skills if s.lower() in cand_set]
    missing = [s for s in target_skills if s.lower() not in cand_set]

    match_pct = round((len(matched) / max(1, len(target_skills))) * 100)

    # Categories breakdown
    categories = [
        {
            "name": "Languages & Core",
            "skills": [
                {"name": "Python", "status": "acquired" if "python" in cand_set else "missing", "importance": "High", "resource": "https://docs.python.org/3/tutorial/"},
                {"name": "TypeScript", "status": "acquired" if "typescript" in cand_set else "missing", "importance": "High", "resource": "https://www.typescriptlang.org/docs/"},
                {"name": "SQL", "status": "acquired" if "sql" in cand_set else "missing", "importance": "High", "resource": "https://sqlbolt.com/"}
            ]
        },
        {
            "name": "Frontend & Web",
            "skills": [
                {"name": "React", "status": "acquired" if "react" in cand_set else "missing", "importance": "High", "resource": "https://react.dev"},
                {"name": "Next.js", "status": "acquired" if "next.js" in cand_set else "missing", "importance": "High", "resource": "https://nextjs.org/docs"},
                {"name": "Tailwind CSS", "status": "acquired" if any("tailwind" in s for s in cand_set) else "missing", "importance": "Medium", "resource": "https://tailwindcss.com/docs"}
            ]
        },
        {
            "name": "Backend & Cloud",
            "skills": [
                {"name": "FastAPI", "status": "acquired" if "fastapi" in cand_set else "missing", "importance": "High", "resource": "https://fastapi.tiangolo.com"},
                {"name": "Docker", "status": "acquired" if "docker" in cand_set else "missing", "importance": "High", "resource": "https://docs.docker.com/get-started/"},
                {"name": "PostgreSQL", "status": "acquired" if "postgresql" in cand_set else "missing", "importance": "High", "resource": "https://www.postgresql.org/docs/"}
            ]
        }
    ]

    recommendations = [
        f"Prioritize building a production portfolio project utilizing: {', '.join(missing[:3])}." if missing else "Continue refining portfolio with automated testing and continuous integration.",
        "Emphasize quantifiable achievements and architectural decisions in your resume project descriptions.",
        "Prepare for technical interviews by practicing data structures & algorithms on LeetCode / NeetCode."
    ]

    return {
        "role": target_role_title,
        "description": target_role_desc,
        "candidate_skills": candidate_skills_list,
        "target_skills": target_skills,
        "matched_skills": matched,
        "missing_skills": missing,
        "match_percentage": match_pct,
        "categories": categories,
        "recommendations": recommendations
    }

@router.post("/gap-analysis")
async def post_skill_gap_analysis(
    payload: SkillGapRequest,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """POST variant for programmatic skill gap requests."""
    skills_query = ",".join(payload.candidate_skills) if payload.candidate_skills else None
    role_param = payload.role_key or "swe-intern"
    return await get_skill_gap_analysis(
        role=role_param,
        skills=skills_query,
        user_id=user_id,
        db=db
    )

