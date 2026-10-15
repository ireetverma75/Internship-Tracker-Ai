"""Pydantic schemas for Applications."""
from datetime import date, datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field


ApplicationStatusType = Literal[
    "Saved",
    "Applied",
    "Assessment",
    "Interview",
    "Selected",
    "Rejected"
]


class ApplicationBase(BaseModel):
    company: str = Field(..., min_length=1, max_length=255)
    role: str = Field(..., min_length=1, max_length=255)
    internship_id: Optional[str] = None
    status: ApplicationStatusType = "Saved"
    applied_date: Optional[date] = None
    interview_date: Optional[date] = None
    deadline: Optional[date] = None
    match_score: Optional[int] = Field(None, ge=0, le=100)
    next_action: Optional[str] = None
    notes: Optional[str] = None
    job_url: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    internship_id: Optional[str] = None
    status: Optional[ApplicationStatusType] = None
    applied_date: Optional[date] = None
    interview_date: Optional[date] = None
    deadline: Optional[date] = None
    match_score: Optional[int] = Field(None, ge=0, le=100)
    next_action: Optional[str] = None
    notes: Optional[str] = None
    job_url: Optional[str] = None


class ApplicationResponse(ApplicationBase):
    id: str
    user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
