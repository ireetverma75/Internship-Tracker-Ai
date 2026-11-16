import uuid
from datetime import datetime, date
from sqlalchemy import String, Text, Integer, Boolean, Date, DateTime, ARRAY, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.sqlite import JSON
from app.db.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    full_name: Mapped[str | None] = mapped_column(String(200))
    degree: Mapped[str | None] = mapped_column(String(100))
    specialization: Mapped[str | None] = mapped_column(String(100))
    graduation_year: Mapped[int | None] = mapped_column(Integer)
    skills: Mapped[str] = mapped_column(JSON, default=list)
    programming_languages: Mapped[str] = mapped_column(JSON, default=list)
    frameworks: Mapped[str] = mapped_column(JSON, default=list)
    certifications: Mapped[str] = mapped_column(JSON, default=list)
    project_titles: Mapped[str] = mapped_column(JSON, default=list)
    career_interests: Mapped[str | None] = mapped_column(Text)
    preferred_locations: Mapped[str | None] = mapped_column(String(200))
    preferred_work_mode: Mapped[str] = mapped_column(String(20), default="any")
    role: Mapped[str] = mapped_column(String(20), default="student")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    parse_status: Mapped[str] = mapped_column(String(20), default="pending")
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    parsed_at: Mapped[datetime | None] = mapped_column(DateTime)

class Internship(Base):
    __tablename__ = "internships"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    company: Mapped[str] = mapped_column(String(200), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    required_skills: Mapped[str] = mapped_column(JSON, default=list)
    preferred_skills: Mapped[str] = mapped_column(JSON, default=list)
    degree_requirement: Mapped[str | None] = mapped_column(String(100))
    experience_level: Mapped[str] = mapped_column(String(50), default="entry")
    location: Mapped[str | None] = mapped_column(String(200))
    work_mode: Mapped[str] = mapped_column(String(20), default="any")
    stipend_min: Mapped[int | None] = mapped_column(Integer)
    stipend_max: Mapped[int | None] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(10), default="INR")
    official_url: Mapped[str | None] = mapped_column(String(500))
    deadline: Mapped[date | None] = mapped_column(Date)
    source: Mapped[str] = mapped_column(String(50), default="manual")
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by: Mapped[str | None] = mapped_column(String)

class SavedInternship(Base):
    __tablename__ = "saved_internships"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    internship_id: Mapped[str] = mapped_column(String, ForeignKey("internships.id"), nullable=False)
    saved_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Application(Base):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    internship_id: Mapped[str | None] = mapped_column(String, ForeignKey("internships.id"))
    company_name: Mapped[str] = mapped_column(String(200), nullable=False)
    role_title: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="saved")
    applied_date: Mapped[date | None] = mapped_column(Date)
    interview_date: Mapped[date | None] = mapped_column(Date)
    deadline: Mapped[date | None] = mapped_column(Date)
    notes: Mapped[str | None] = mapped_column(Text)
    external_url: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    job_title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    company: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    job_type: Mapped[str | None] = mapped_column(String(100), index=True)
    description: Mapped[str | None] = mapped_column(Text)
    qualifications: Mapped[str | None] = mapped_column(Text)
    duties: Mapped[str | None] = mapped_column(Text)
    pay: Mapped[str | None] = mapped_column(String(100))
    source: Mapped[str] = mapped_column(String(100), default="huggingface_jobs_dataset")
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
