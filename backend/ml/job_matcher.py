"""
Job Matcher Engine using Scikit-Learn TF-IDF, Cosine Similarity, and Skill Gap Analysis.
Calculates objective, deterministic match scores and actionable recommendations.
"""
from typing import Dict, Any, List, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from ml.skill_extractor import (
    extract_skills_from_text,
    extract_skills_from_job,
    analyze_skill_gap
)
from ml.resume_parser import extract_candidate_education

def compute_tfidf_similarity(resume_text: str, job_text: str) -> float:
    """
    Vectorize resume and job description using TF-IDF and compute Cosine Similarity.
    Returns float in range [0.0, 1.0].
    """
    if not resume_text.strip() or not job_text.strip():
        return 0.0

    try:
        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=5000,
            sublinear_tf=True
        )
        tfidf_matrix = vectorizer.fit_transform([resume_text, job_text])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(np.clip(sim, 0.0, 1.0))
    except Exception:
        return 0.0

def compare_qualifications(resume_text: str, job_qualifications: str) -> str:
    """Compare candidate education with job qualifications."""
    cand_edu = extract_candidate_education(resume_text)
    deg = cand_edu.get("degree")

    if not job_qualifications:
        return "No specific formal degree requirement mentioned."

    job_qual_lower = job_qualifications.lower()

    if deg and deg.lower() in job_qual_lower:
        return f"Degree requirement matched: Candidate holds {deg}."
    elif deg:
        if any(term in job_qual_lower for term in ["bachelor", "degree", "bs", "b.tech", "b.e."]):
            return f"Candidate holds {deg}, which aligns with the undergraduate degree requirements."
        return f"Candidate holds {deg}."
    else:
        return "Degree status unspecified in resume; verify graduation requirements in posting."

def generate_improvement_recommendations(
    role: str,
    company: str,
    matched_skills: List[str],
    missing_skills: List[str],
    score: float
) -> str:
    """Generate actionable, resume-grounded advice for the student."""
    if not missing_skills:
        if score >= 75:
            return f"Excellent match! Your skill set aligns directly with {role} at {company}. Highlight your practical implementations of {', '.join(matched_skills[:3])} in your cover letter and interview portfolio."
        else:
            return f"Your core technical skills align well with the job description. Further tailor your project bullet points to emphasize relevant industry tools."

    top_missing = missing_skills[:3]
    if len(top_missing) == 1:
        missing_phrase = top_missing[0]
    elif len(top_missing) == 2:
        missing_phrase = f"{top_missing[0]} and {top_missing[1]}"
    else:
        missing_phrase = f"{', '.join(top_missing[:-1])}, and {top_missing[-1]}"

    if score >= 75:
        return f"Strong profile! To further strengthen your application for {role} at {company}, consider brushing up on {missing_phrase} and showcasing relevant coursework or repositories."
    elif score >= 50:
        return f"Improve your {missing_phrase} knowledge to strengthen your profile for this {role} listing."
    else:
        return f"Significant skill gap detected for {role}. Prioritize building hands-on projects with {missing_phrase} before targeting this level of position."

def match_resume_to_job(
    resume_text: str,
    job: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Perform complete AI matching between a candidate's resume and a job listing.
    """
    # 1. Text representations
    job_desc = job.get("description") or ""
    job_qual = job.get("qualifications") or ""
    job_duties = job.get("duties") or ""
    job_full_text = f"{job.get('job_title', '')}\n{job_desc}\n{job_qual}\n{job_duties}"

    # 2. Skill Extraction
    candidate_skills = extract_skills_from_text(resume_text)
    job_skills = extract_skills_from_job(job_desc, job_qual, job_duties)

    # 3. Skill Gap Analysis
    matched_skills, missing_skills, overlap_ratio = analyze_skill_gap(candidate_skills, job_skills)

    # 4. TF-IDF & Cosine Similarity
    tfidf_sim = compute_tfidf_similarity(resume_text, job_full_text)

    # 5. Qualification analysis
    qual_match = compare_qualifications(resume_text, job_qual)
    edu_score = 0.8 if "matched" in qual_match.lower() or "aligns" in qual_match.lower() else 0.5

    # 6. Composite Match Score
    # In NLP document matching, raw TF-IDF cosine similarity between resume and JD ranges from 0.05 to 0.45.
    # We calibrate raw cosine similarity so that 0.40+ represents near-perfect topical vocabulary overlap.
    calibrated_tfidf = min(1.0, tfidf_sim * 2.2)
    composite = (overlap_ratio * 0.55) + (calibrated_tfidf * 0.35) + (edu_score * 0.10)
    match_score = round(float(np.clip(composite * 100, 5.0, 98.0)), 1)

    # 7. Actionable Recommendation
    rec = generate_improvement_recommendations(
        role=job.get("job_title", "Position"),
        company=job.get("company", "Company"),
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        score=match_score
    )

    return {
        "job_id": job.get("id", ""),
        "job_title": job.get("job_title", ""),
        "company": job.get("company", ""),
        "job_type": job.get("job_type", "General"),
        "pay": job.get("pay", ""),
        "is_synthetic": bool(job.get("is_synthetic", False)),
        "match_score": match_score,
        "tfidf_similarity": round(tfidf_sim, 4),
        "skill_overlap_ratio": overlap_ratio,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "recommendation": rec,
        "qualification_match": qual_match,
        "candidate_skills": candidate_skills
    }
