from pydantic import BaseModel
from typing import Optional

class AnalysisRequest(BaseModel):
    text: str

class AnalysisExtracted(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    required_skills: list[str] = []
    preferred_skills: list[str] = []
    responsibilities: list[str] = []
    eligibility: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    compensation: Optional[str] = None
    deadline: Optional[str] = None

class MatchPreview(BaseModel):
    score: float
    matched_skills: list[str] = []
    missing_skills: list[str] = []

class AnalysisResponse(BaseModel):
    is_demo: bool
    extracted: AnalysisExtracted
    match_preview: MatchPreview
