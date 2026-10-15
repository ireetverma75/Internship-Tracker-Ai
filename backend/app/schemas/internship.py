"""Pydantic schemas for Internships."""
from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class InternshipBase(BaseModel):
    company: str = Field(..., min_length=1, max_length=255, description="Company name")
    role: str = Field(..., min_length=1, max_length=255, description="Role title")
    description: Optional[str] = None
    location: Optional[str] = "Remote"
    work_mode: Optional[str] = "Remote"
    stipend: Optional[str] = None
    deadline: Optional[date] = None
    job_url: Optional[str] = None
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    eligibility: Optional[str] = None
    notes: Optional[str] = None
    is_saved: Optional[bool] = False
    is_demo: Optional[bool] = False


class InternshipCreate(InternshipBase):
    pass


class InternshipUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    stipend: Optional[str] = None
    deadline: Optional[date] = None
    job_url: Optional[str] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    eligibility: Optional[str] = None
    notes: Optional[str] = None
    is_saved: Optional[bool] = None


class InternshipResponse(InternshipBase):
    id: str
    user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
