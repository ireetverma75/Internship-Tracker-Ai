"""Job Description Analyzer service with live AI adapter and deterministic fallback."""
import re
from typing import List, Optional, Tuple
from app.schemas.analysis import JobAnalysisRequest, JobAnalysisResponse
from app.services.ai_provider import ai_provider

# Known skill vocabulary for deterministic extraction
COMMON_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "C++", "C#", "Java",
    "Go", "Rust", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "PyTorch", "TensorFlow",
    "Scikit-Learn", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "GitHub", "Linux",
    "REST APIs", "GraphQL", "FastAPI", "Django", "Flask", "Tailwind CSS", "HTML5", "CSS3",
    "Figma", "CI/CD", "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
    "Algorithms", "Data Structures", "System Design", "Agile", "Scrum"
]


class JobAnalyzerService:
    async def analyze(self, request: JobAnalysisRequest) -> JobAnalysisResponse:
        description = request.description.strip()

        # If live AI is configured, try live LLM analysis
        if ai_provider.is_live_configured:
            llm_result = await self._analyze_with_llm(description, request.job_url)
            if llm_result:
                return llm_result

        # Fallback to deterministic rule-based analysis
        return self._deterministic_analysis(description, request.job_url)

    async def _analyze_with_llm(self, text: str, job_url: Optional[str]) -> Optional[JobAnalysisResponse]:
        system_prompt = (
            "You are an expert technical recruiter and job analyst. Analyze the following job description "
            "and extract structured JSON with these exact keys: "
            "role (string), company (string or null), experience_requirement (string or 'Not specified'), "
            "eligibility_criteria (string or 'Not specified'), required_skills (array of strings), "
            "preferred_skills (array of strings), responsibilities (array of strings, max 6 items), "
            "location (string or 'Not specified'), work_mode (Remote, Hybrid, On-site, or 'Not specified'), "
            "stipend_or_salary (string or 'Not specified'), application_deadline (string or 'Not specified'), "
            "important_qualifications (array of strings), summary (2-3 concise sentences). "
            "CRITICAL: Do NOT invent information missing from text. Use 'Not specified' or empty list."
        )

        prompt = f"Job Posting Description:\n{text[:4000]}"
        if job_url:
            prompt += f"\n\nSource URL: {job_url}"

        data = await ai_provider.generate_json(prompt, system_prompt)
        if not data:
            return None

        try:
            return JobAnalysisResponse(
                role=data.get("role") or "Software Engineering Intern",
                company=data.get("company"),
                experience_requirement=data.get("experience_requirement") or "Not specified",
                eligibility_criteria=data.get("eligibility_criteria") or "Not specified",
                required_skills=list(data.get("required_skills", [])),
                preferred_skills=list(data.get("preferred_skills", [])),
                responsibilities=list(data.get("responsibilities", [])),
                location=data.get("location") or "Not specified",
                work_mode=data.get("work_mode") or "Not specified",
                stipend_or_salary=data.get("stipend_or_salary") or "Not specified",
                application_deadline=data.get("application_deadline") or "Not specified",
                important_qualifications=list(data.get("important_qualifications", [])),
                summary=data.get("summary") or "Opportunity extracted from provided job description.",
                is_demo=False,
                model_used="ai-provider-live"
            )
        except Exception:
            return None

    def _deterministic_analysis(self, text: str, job_url: Optional[str]) -> JobAnalysisResponse:
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        first_lines = lines[:5] if lines else ["Software Engineering Intern"]
        
        # 1. Detect Role
        role = "Software Engineering Intern"
        role_patterns = [
            r"(frontend|backend|full[\s-]stack|machine learning|ai|data science|software engineer|swe|product manager|mobile|ios|android|devops|cloud)\s*(intern|internship|fellow|co-op)?",
            r"([A-Za-z\s]+(intern|internship|co-op|engineer))"
        ]
        for line in first_lines:
            match = re.search(r"(intern|internship|co-op|fellow)", line, re.IGNORECASE)
            if match and len(line) < 80:
                role = line.strip("#-* ")
                break

        # 2. Detect Company
        company = None
        for line in first_lines:
            comp_match = re.search(r"(at|about|join|welcome to)\s+([A-Z][A-Za-z0-9&.\s]{1,30})", line, re.IGNORECASE)
            if comp_match:
                company = comp_match.group(2).strip()
                break
        if not company:
            # Check for common tech names in text
            tech_cos = ["Microsoft", "Google", "Amazon", "Apple", "Meta", "NVIDIA", "Stripe", "Atlassian", "Figma", "OpenAI", "Anthropic", "Spotify", "Uber"]
            for co in tech_cos:
                if re.search(rf"\b{co}\b", text, re.IGNORECASE):
                    company = co
                    break

        # 3. Detect Skills
        text_lower = text.lower()
        found_skills = []
        for skill in COMMON_SKILLS:
            # Word boundary matching
            pattern = rf"(?<![\w#+]){re.escape(skill.lower())}(?![\w#+])"
            if re.search(pattern, text_lower):
                found_skills.append(skill)

        # Split into required & preferred
        if len(found_skills) > 4:
            required_skills = found_skills[:int(len(found_skills) * 0.65)]
            preferred_skills = found_skills[int(len(found_skills) * 0.65):]
        else:
            required_skills = found_skills
            preferred_skills = []

        # 4. Work Mode
        work_mode = "Not specified"
        if re.search(r"\bremote\b", text_lower):
            work_mode = "Remote"
        elif re.search(r"\bhybrid\b", text_lower):
            work_mode = "Hybrid"
        elif re.search(r"\b(on-site|onsite|in-office|in-person)\b", text_lower):
            work_mode = "On-site"

        # 5. Location
        location = "Not specified"
        loc_match = re.search(r"(location|based in|office in):\s*([A-Za-z\s,]+)", text, re.IGNORECASE)
        if loc_match:
            location = loc_match.group(2).strip().split("\n")[0]
        elif work_mode == "Remote":
            location = "Remote / Distributed"

        # 6. Salary / Stipend
        stipend = "Not specified"
        salary_match = re.search(r"(\$\d+[\d,]*(\.\d{2})?\s*(?:/hr|/hour|/mo|/month|/yr|k|- \$\d+[\d,]*\s*(?:/hr|/hour|/mo|/month|/yr|k)?))", text, re.IGNORECASE)
        if salary_match:
            stipend = salary_match.group(1).strip()

        # 7. Deadline
        deadline = "Not specified"
        dl_match = re.search(r"(deadline|apply by|applications close):\s*([A-Za-z0-9\s,]+)", text, re.IGNORECASE)
        if dl_match:
            deadline = dl_match.group(2).strip().split("\n")[0]

        # 8. Eligibility & Qualifications
        eligibility = "Currently enrolled in a Bachelor's, Master's, or PhD in Computer Science or related STEM field."
        if re.search(r"(bachelor|master|phd|enrolled|degree|undergraduate|penultimate)", text_lower):
            elig_sentences = [s.strip() for s in text.split(".") if any(w in s.lower() for w in ["degree", "enrolled", "bachelor", "master", "student", "graduat"])]
            if elig_sentences:
                eligibility = elig_sentences[0].strip() + "."

        # 9. Responsibilities
        responsibilities = []
        for line in lines:
            line_s = line.strip("•-* ")
            if (line.startswith(("-", "•", "*", "1.", "2.", "3.")) or any(w in line.lower() for w in ["collaborate", "develop", "build", "design", "implement", "test"])) and 15 < len(line_s) < 180:
                responsibilities.append(line_s)
                if len(responsibilities) >= 5:
                    break
        if not responsibilities:
            responsibilities = [
                "Collaborate with engineering teams to design, build, and test software modules.",
                "Participate in code reviews, design discussions, and sprint retrospectives.",
                "Deliver production-quality code adhering to engineering standards."
            ]

        # 10. Summary
        summary = (
            f"Opportunity for {role} at {company or 'the hiring team'}. "
            f"Looking for candidates skilled in {', '.join(required_skills[:3]) if required_skills else 'core CS fundamentals'}. "
            f"Work arrangement is {work_mode.lower()}."
        )

        return JobAnalysisResponse(
            role=role,
            company=company or "Technology Company",
            experience_requirement="0-1 years / Student or Recent Graduate",
            eligibility_criteria=eligibility,
            required_skills=required_skills,
            preferred_skills=preferred_skills,
            responsibilities=responsibilities,
            location=location,
            work_mode=work_mode,
            stipend_or_salary=stipend,
            application_deadline=deadline,
            important_qualifications=[
                "Strong foundation in data structures, algorithms, and software engineering principles.",
                "Demonstrated project or coursework experience in modern web or backend architectures."
            ],
            summary=summary,
            is_demo=True,
            model_used="deterministic-fallback-v1"
        )


job_analyzer = JobAnalyzerService()
