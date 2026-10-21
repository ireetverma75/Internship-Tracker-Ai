from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProfileOut(BaseModel):
    id: str
    user_id: str
    full_name: Optional[str] = None
    degree: Optional[str] = None
    specialization: Optional[str] = None
    graduation_year: Optional[int] = None
    skills: list[str] = []
    programming_languages: list[str] = []
    frameworks: list[str] = []
    certifications: list[str] = []
    project_titles: list[str] = []
    career_interests: Optional[str] = None
    preferred_locations: Optional[str] = None
    preferred_work_mode: str = "any"
    role: str = "student"
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    degree: Optional[str] = None
    specialization: Optional[str] = None
    graduation_year: Optional[int] = None
    skills: Optional[list[str]] = None
    programming_languages: Optional[list[str]] = None
    frameworks: Optional[list[str]] = None
    certifications: Optional[list[str]] = None
    project_titles: Optional[list[str]] = None
    career_interests: Optional[str] = None
    preferred_locations: Optional[str] = None
    preferred_work_mode: Optional[str] = None

class ExtractedProfile(BaseModel):
    skills: list[str] = []
    programming_languages: list[str] = []
    frameworks: list[str] = []
    certifications: list[str] = []
    project_titles: list[str] = []
    career_interests: str = ""
    degree: Optional[str] = None
    specialization: Optional[str] = None
    graduation_year: Optional[int] = None
