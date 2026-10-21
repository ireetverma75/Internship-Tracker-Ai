from pydantic import BaseModel, HttpUrl, field_validator
from typing import Optional
from datetime import date, datetime

class InternshipBase(BaseModel):
    company: str
    title: str
    description: str
    required_skills: list[str] = []
    preferred_skills: list[str] = []
    degree_requirement: Optional[str] = None
    experience_level: str = "entry"
    location: Optional[str] = None
    work_mode: str = "any"
    stipend_min: Optional[int] = None
    stipend_max: Optional[int] = None
    currency: str = "INR"
    official_url: Optional[str] = None
    deadline: Optional[date] = None
    source: str = "manual"
    is_demo: bool = False

class InternshipCreate(InternshipBase):
    pass

class InternshipUpdate(BaseModel):
    company: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[list[str]] = None
    preferred_skills: Optional[list[str]] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    stipend_min: Optional[int] = None
    stipend_max: Optional[int] = None
    official_url: Optional[str] = None
    deadline: Optional[date] = None
    is_active: Optional[bool] = None

class MatchDetails(BaseModel):
    score: float
    matched_skills: list[str] = []
    missing_skills: list[str] = []
    explanation: str = ""

class InternshipOut(InternshipBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    match_details: Optional[MatchDetails] = None
    is_saved: bool = False

    model_config = {"from_attributes": True}

class PaginatedInternships(BaseModel):
    items: list[InternshipOut]
    total: int
    page: int
    per_page: int
