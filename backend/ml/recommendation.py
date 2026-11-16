"""
Job Recommendation Engine.
Ranks database job listings against candidate resume credentials using
TF-IDF vectorization and skill similarity metrics.
"""
from typing import List, Dict, Any, Optional
from ml.job_matcher import match_resume_to_job
from ml.skill_extractor import extract_skills_from_text

def recommend_jobs_for_resume(
    resume_text: str,
    jobs: List[Dict[str, Any]],
    top_n: int = 10,
    job_type_filter: Optional[str] = None,
    min_score: float = 0.0,
    include_synthetic: bool = True
) -> Dict[str, Any]:
    """
    Evaluate candidate resume against a set of jobs and recommend top matches.
    """
    candidate_skills = extract_skills_from_text(resume_text)

    evaluated_matches: List[Dict[str, Any]] = []

    for job in jobs:
        # Check filters
        if not include_synthetic and job.get("is_synthetic", False):
            continue
        if job_type_filter and job.get("job_type", "").lower() != job_type_filter.lower():
            continue

        match_res = match_resume_to_job(resume_text, job)
        if match_res["match_score"] >= min_score:
            evaluated_matches.append(match_res)

    # Sort descending by match_score
    evaluated_matches.sort(key=lambda x: x["match_score"], reverse=True)

    top_recommendations = evaluated_matches[:top_n]

    return {
        "total_recommendations": len(top_recommendations),
        "extracted_candidate_skills": candidate_skills,
        "recommendations": top_recommendations
    }
