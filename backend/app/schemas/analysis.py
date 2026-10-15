"""Pydantic schemas for AI Job Description Analyzer."""
from typing import List, Optional
from pydantic import BaseModel, Field


class JobAnalysisRequest(BaseModel):
    description: str = Field(..., min_length=10, description="Raw job description text")
    job_url: Optional[str] = Field(None, description="Optional original job posting URL")


class JobAnalysisResponse(BaseModel):
    role: str
    company: Optional[str] = None
    experience_requirement: Optional[str] = "Not specified"
    eligibility_criteria: Optional[str] = "Not specified"
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    responsibilities: List[str] = Field(default_factory=list)
    location: Optional[str] = "Not specified"
    work_mode: Optional[str] = "Not specified"  # Remote, Hybrid, On-site, Not specified
    stipend_or_salary: Optional[str] = "Not specified"
    application_deadline: Optional[str] = "Not specified"
    important_qualifications: List[str] = Field(default_factory=list)
    summary: str
    is_demo: bool = False
    model_used: str = "deterministic-fallback-v1"
