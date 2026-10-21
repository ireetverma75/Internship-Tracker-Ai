from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

VALID_STATUSES = ["saved", "applied", "assessment", "interview", "selected", "rejected"]

class ApplicationCreate(BaseModel):
    internship_id: Optional[str] = None
    company_name: str
    role_title: str
    status: str = "saved"
    applied_date: Optional[date] = None
    interview_date: Optional[date] = None
    deadline: Optional[date] = None
    notes: Optional[str] = None
    external_url: Optional[str] = None

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    applied_date: Optional[date] = None
    interview_date: Optional[date] = None
    deadline: Optional[date] = None
    notes: Optional[str] = None
    external_url: Optional[str] = None

class ApplicationOut(BaseModel):
    id: str
    user_id: str
    internship_id: Optional[str] = None
    company_name: str
    role_title: str
    status: str
    applied_date: Optional[date] = None
    interview_date: Optional[date] = None
    deadline: Optional[date] = None
    notes: Optional[str] = None
    external_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class ApplicationsResponse(BaseModel):
    items: list[ApplicationOut]
    total: int
