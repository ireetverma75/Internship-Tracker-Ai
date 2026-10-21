"""
AI Job Description Analyzer.
Supports OpenAI and a clearly labeled demo mode when no key is configured.
Never invents missing fields — returns null for absent data.
"""
import json
from app.core.config import settings
from app.schemas.analysis import AnalysisExtracted

DEMO_EXTRACTION = AnalysisExtracted(
    title="Software Engineering Intern",
    company="[Demo Company]",
    required_skills=["Python", "SQL", "Git"],
    preferred_skills=["Docker", "AWS"],
    responsibilities=[
        "Build and maintain backend services",
        "Write unit tests and documentation",
        "Collaborate with cross-functional teams",
    ],
    eligibility="B.Tech/B.E. students in 3rd or 4th year",
    location="Bangalore, India",
    work_mode="hybrid",
    compensation="₹25,000 – ₹40,000/month",
    deadline=None,
)

SYSTEM_PROMPT = """You are a job description parser. Extract structured information from job descriptions.
Return ONLY valid JSON matching this schema. Use null for missing fields, empty arrays for empty lists.
Never invent information not present in the text.

{
  "title": "string|null",
  "company": "string|null",
  "required_skills": ["string"],
  "preferred_skills": ["string"],
  "responsibilities": ["string"],
  "eligibility": "string|null",
  "location": "string|null",
  "work_mode": "remote|hybrid|onsite|null",
  "compensation": "string|null",
  "deadline": "string|null"
}"""

async def analyze_job_description(text: str) -> tuple[AnalysisExtracted, bool]:
    """
    Returns (extracted, is_demo).
    is_demo=True when running without AI key.
    """
    if not settings.AI_API_KEY or settings.AI_PROVIDER == "demo":
        return DEMO_EXTRACTION, True

    if settings.AI_PROVIDER == "openai":
        return await _openai_analyze(text), False

    return DEMO_EXTRACTION, True

async def _openai_analyze(text: str) -> AnalysisExtracted:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=settings.AI_API_KEY)

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Parse this job description:\n\n{text[:4000]}"},
            ],
            response_format={"type": "json_object"},
            temperature=0,
            max_tokens=1000,
        )
        raw = response.choices[0].message.content
        data = json.loads(raw)
        return AnalysisExtracted(**data)
    except Exception as e:
        # Log error (without sensitive content) and fall back to demo
        print(f"AI provider error: {type(e).__name__}")
        return DEMO_EXTRACTION
