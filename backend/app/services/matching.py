"""Resume-to-Job Matching service with transparent scoring and deterministic fallback."""
import re
from typing import List, Optional, Tuple, Dict, Any
from app.schemas.resume import ResumeMatchRequest, ResumeMatchResponse
from app.services.ai_provider import ai_provider

# Common technical skill synonym mappings
SYNONYMS: Dict[str, List[str]] = {
    "react": ["react", "reactjs", "react.js"],
    "next.js": ["next.js", "nextjs", "next"],
    "javascript": ["javascript", "js", "ecmascript"],
    "typescript": ["typescript", "ts"],
    "node.js": ["node.js", "nodejs", "node"],
    "python": ["python", "python3", "py"],
    "c++": ["c++", "cpp"],
    "c#": ["c#", "csharp", "dotnet", ".net"],
    "postgres": ["postgres", "postgresql"],
    "k8s": ["k8s", "kubernetes"],
    "docker": ["docker", "containerization", "containers"],
    "aws": ["aws", "amazon web services", "ec2", "s3", "lambda"],
    "gcp": ["gcp", "google cloud", "google cloud platform"],
    "azure": ["azure", "microsoft azure"],
    "rest apis": ["rest", "restful", "rest api", "rest apis", "api"],
    "machine learning": ["machine learning", "ml", "statistical learning"],
    "deep learning": ["deep learning", "dl", "neural networks", "cnn", "rnn", "transformer"],
    "sql": ["sql", "relational database", "rdbms"]
}


class ResumeMatchingService:
    async def match(self, request: ResumeMatchRequest) -> ResumeMatchResponse:
        # If live AI is configured, try LLM-augmented semantic matching
        if ai_provider.is_live_configured:
            llm_result = await self._match_with_llm(request)
            if llm_result:
                return llm_result

        # Deterministic rule-based matching
        return self._deterministic_match(request)

    async def _match_with_llm(self, req: ResumeMatchRequest) -> Optional[ResumeMatchResponse]:
        system_prompt = (
            "You are an objective AI career analyst. Compare the provided resume text against the target job requirements. "
            "Return structured JSON with keys: "
            "match_score (integer 0-100), matched_required_skills (array of strings), "
            "missing_required_skills (array of strings), preferred_skills_found (array of strings), "
            "relevant_experience_evidence (array of 2-4 string bullet quotes/snippets from resume), "
            "education_observations (array of 1-2 strings), "
            "resume_improvement_suggestions (array of 2-4 actionable bullet strings), "
            "recommended_skills_to_learn (array of 2-4 strings), "
            "scoring_explanation (concise explanation of formula used). "
            "Score formula: 70% required skill overlap, 20% preferred skill overlap, 10% experience context. "
            "NEVER claim hiring probability."
        )

        prompt = (
            f"Target Role: {req.job_role} at {req.job_company or 'Company'}\n"
            f"Required Skills: {', '.join(req.required_skills) if req.required_skills else 'None specified'}\n"
            f"Preferred Skills: {', '.join(req.preferred_skills) if req.preferred_skills else 'None specified'}\n"
            f"Job Description Excerpt: {(req.job_description or '')[:1000]}\n\n"
            f"Candidate Resume Text (truncated):\n{req.resume_text[:4000]}"
        )

        data = await ai_provider.generate_json(prompt, system_prompt)
        if not data:
            return None

        try:
            score = int(data.get("match_score", 50))
            score = max(0, min(100, score))
            return ResumeMatchResponse(
                match_score=score,
                matched_required_skills=list(data.get("matched_required_skills", [])),
                missing_required_skills=list(data.get("missing_required_skills", [])),
                preferred_skills_found=list(data.get("preferred_skills_found", [])),
                relevant_experience_evidence=list(data.get("relevant_experience_evidence", [])),
                education_observations=list(data.get("education_observations", [])),
                resume_improvement_suggestions=list(data.get("resume_improvement_suggestions", [])),
                recommended_skills_to_learn=list(data.get("recommended_skills_to_learn", [])),
                scoring_explanation=data.get("scoring_explanation") or "Evaluated via live AI semantic matching model.",
                is_demo=False,
                model_used="ai-provider-live"
            )
        except Exception:
            return None

    def _deterministic_match(self, req: ResumeMatchRequest) -> ResumeMatchResponse:
        resume_lower = req.resume_text.lower()
        req_skills = req.required_skills or []
        pref_skills = req.preferred_skills or []

        matched_req = []
        missing_req = []
        for skill in req_skills:
            if self._skill_in_text(skill, resume_lower):
                matched_req.append(skill)
            else:
                missing_req.append(skill)

        pref_found = []
        for skill in pref_skills:
            if self._skill_in_text(skill, resume_lower):
                pref_found.append(skill)

        # Calculate Score
        # 70% Required Skills, 20% Preferred Skills, 10% CS/Degree Evidence
        if req_skills:
            req_ratio = len(matched_req) / len(req_skills)
            req_component = req_ratio * 70.0
        else:
            req_component = 70.0  # If no required skills were specified

        if pref_skills:
            pref_ratio = len(pref_found) / len(pref_skills)
            pref_component = pref_ratio * 20.0
        else:
            pref_component = 15.0  # Neutral baseline if preferred skills unspecified

        # Check education / baseline keywords
        has_degree = bool(re.search(r"(bachelor|master|b\.s|m\.s|computer science|engineering|university|college|gpa)", resume_lower))
        has_projects = bool(re.search(r"(project|developed|built|architected|implemented|github)", resume_lower))
        edu_component = 0.0
        if has_degree:
            edu_component += 5.0
        if has_projects:
            edu_component += 5.0

        final_score = int(round(req_component + pref_component + edu_component))
        final_score = max(5, min(98, final_score))

        # Relevant experience evidence snippets
        evidence = []
        sentences = [s.strip() for s in req.resume_text.replace("\n", ". ").split(".") if len(s.strip()) > 20]
        for s in sentences:
            if any(skill.lower() in s.lower() for skill in matched_req[:3]):
                evidence.append(s[:150] + ("..." if len(s) > 150 else ""))
                if len(evidence) >= 3:
                    break
        if not evidence:
            evidence = ["Relevant engineering projects and coursework documented in uploaded resume."]

        # Education observations
        education_obs = []
        if has_degree:
            education_obs.append("Academic background in Computer Science or STEM-related disciplines identified.")
        else:
            education_obs.append("Academic credential information was not prominently detected in plain text extraction.")

        # Improvement suggestions
        improvements = []
        if missing_req:
            top_missing = ", ".join(missing_req[:3])
            improvements.append(f"Add concrete project bullets demonstrating practical experience with: {top_missing}.")
        improvements.append("Quantify accomplishments with measurable metrics (e.g., '% performance improvement', 'requests/sec served', 'users supported').")
        improvements.append("Ensure key technologies appear in both a dedicated Technical Skills summary and corresponding experience bullet points.")

        # Recommended skills to learn
        recommended_learn = missing_req[:4]
        if not recommended_learn:
            recommended_learn = ["System Design Fundamentals", "CI/CD Pipeline Automation", "Unit & Integration Testing"]

        # Transparent explanation
        req_count = len(req_skills)
        matched_count = len(matched_req)
        scoring_explanation = (
            f"Transparent scoring model: 70% Required Skills ({matched_count}/{req_count} matched), "
            f"20% Preferred Skills ({len(pref_found)}/{len(pref_skills) if pref_skills else 1} matched), "
            f"10% Baseline Education/Project verification. "
            f"Note: This score indicates textual requirement overlap for screening preparation, not a hiring decision."
        )

        return ResumeMatchResponse(
            match_score=final_score,
            matched_required_skills=matched_req,
            missing_required_skills=missing_req,
            preferred_skills_found=pref_found,
            relevant_experience_evidence=evidence,
            education_observations=education_obs,
            resume_improvement_suggestions=improvements,
            recommended_skills_to_learn=recommended_learn,
            scoring_explanation=scoring_explanation,
            is_demo=True,
            model_used="deterministic-matching-v1"
        )

    def _skill_in_text(self, skill: str, text_lower: str) -> bool:
        s_clean = skill.strip().lower()
        # Direct word match
        pattern = rf"(?<![\w#+]){re.escape(s_clean)}(?![\w#+])"
        if re.search(pattern, text_lower):
            return True
        # Check synonyms
        syns = SYNONYMS.get(s_clean, [])
        for syn in syns:
            p = rf"(?<![\w#+]){re.escape(syn)}(?![\w#+])"
            if re.search(p, text_lower):
                return True
        return False


resume_matching = ResumeMatchingService()
