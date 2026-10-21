"""
Deterministic internship matching algorithm.
Score = profile relevance estimate. NOT probability of receiving offer.

Weights:
  required_skill_overlap: 40%
  preferred_skill_overlap: 20%
  education_match: 20%
  project_experience_score: 15%
  location_preference_match: 5%
"""
from app.schemas.internship import MatchDetails

def normalize(skills: list) -> set[str]:
    return {s.lower().strip() for s in skills if s}

def compute_match(profile: dict, internship_required: list, internship_preferred: list,
                  internship_location: str | None, internship_work_mode: str,
                  degree_req: str | None) -> MatchDetails:

    resume_skills = normalize(profile.get("skills", []) +
                              profile.get("programming_languages", []) +
                              profile.get("frameworks", []))
    req_skills = normalize(internship_required)
    pref_skills = normalize(internship_preferred)

    # Required skill overlap (40%)
    if req_skills:
        matched_req = resume_skills & req_skills
        req_score = len(matched_req) / len(req_skills)
    else:
        matched_req = set()
        req_score = 0.5  # No requirements specified — neutral

    # Preferred skill overlap (20%)
    if pref_skills:
        matched_pref = resume_skills & pref_skills
        pref_score = len(matched_pref) / len(pref_skills)
    else:
        matched_pref = set()
        pref_score = 0.5

    # Education match (20%)
    edu_score = 0.5  # default: unknown
    if degree_req:
        profile_degree = (profile.get("degree") or "").lower()
        if profile_degree and any(word in degree_req.lower() for word in profile_degree.split()):
            edu_score = 1.0
        elif profile_degree:
            edu_score = 0.3

    # Project/experience score (15%)
    project_score = 0.5
    if profile.get("project_titles") and len(profile.get("project_titles", [])) > 0:
        project_score = min(1.0, len(profile.get("project_titles", [])) / 3)

    # Location match (5%)
    loc_score = 0.5
    pref_loc = (profile.get("preferred_locations") or "").lower()
    pref_mode = (profile.get("preferred_work_mode") or "any").lower()
    if internship_work_mode == "remote" and pref_mode == "remote":
        loc_score = 1.0
    elif internship_location and pref_loc and any(l in pref_loc for l in internship_location.lower().split(",")):
        loc_score = 1.0
    elif internship_work_mode == "any" or pref_mode == "any":
        loc_score = 0.7

    total = (
        req_score * 0.40 +
        pref_score * 0.20 +
        edu_score * 0.20 +
        project_score * 0.15 +
        loc_score * 0.05
    )

    score = round(total * 100, 1)

    all_matched = list(matched_req | matched_pref)
    all_missing = list((req_skills - resume_skills) | (pref_skills - resume_skills))

    explanation = _build_explanation(score, matched_req, req_skills, pref_skills, matched_pref)

    return MatchDetails(
        score=score,
        matched_skills=sorted(all_matched)[:10],
        missing_skills=sorted(all_missing)[:10],
        explanation=explanation
    )

def _build_explanation(score: float, matched_req: set, req_skills: set,
                       pref_skills: set, matched_pref: set) -> str:
    parts = []
    if req_skills:
        parts.append(f"You match {len(matched_req)}/{len(req_skills)} required skills.")
    if pref_skills:
        parts.append(f"You match {len(matched_pref)}/{len(pref_skills)} preferred skills.")
    if score >= 75:
        parts.append("Strong alignment with this role.")
    elif score >= 50:
        parts.append("Moderate fit — some skill gaps to address.")
    else:
        parts.append("Low match — consider building missing skills before applying.")
    return " ".join(parts)
