"""Pydantic schemas for Resume Parsing and AI Matching."""
from typing import List, Optional
from pydantic import BaseModel, Field


class ResumeParseResponse(BaseModel):
    filename: str
    page_count: int
    char_count: int
    word_count: int
    extracted_text: str
    detected_skills: List[str] = Field(default_factory=list)
    is_encrypted: bool = False
    warning: Optional[str] = None


class ResumeMatchRequest(BaseModel):
    resume_text: str = Field(..., min_length=20, description="Extracted resume text")
    job_role: str = Field(..., min_length=1)
    job_company: Optional[str] = None
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    job_description: Optional[str] = None


class ResumeMatchResponse(BaseModel):
    match_score: int = Field(..., ge=0, le=100)
    matched_required_skills: List[str] = Field(default_factory=list)
    missing_required_skills: List[str] = Field(default_factory=list)
    preferred_skills_found: List[str] = Field(default_factory=list)
    relevant_experience_evidence: List[str] = Field(default_factory=list)
    education_observations: List[str] = Field(default_factory=list)
    resume_improvement_suggestions: List[str] = Field(default_factory=list)
    recommended_skills_to_learn: List[str] = Field(default_factory=list)
    scoring_explanation: str
    is_demo: bool = False
    model_used: str = "deterministic-matching-v1"
