"""SQLAlchemy models for Internship Tracker AI."""
import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    Date,
    Integer,
    Text,
    JSON,
    ForeignKey
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class InternshipModel(Base):
    __tablename__ = "internships"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), nullable=True, index=True)
    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String(255), default="Remote")
    work_mode = Column(String(50), default="Remote")  # Remote, Hybrid, On-site
    stipend = Column(String(100), nullable=True)
    deadline = Column(Date, nullable=True, index=True)
    job_url = Column(Text, nullable=True)
    required_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)
    eligibility = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False)
    is_saved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    applications = relationship("ApplicationModel", back_populates="internship", cascade="all, delete-orphan")


class ApplicationModel(Base):
    __tablename__ = "applications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), nullable=True, index=True)
    internship_id = Column(String(36), ForeignKey("internships.id", ondelete="SET NULL"), nullable=True)
    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    status = Column(String(50), default="Saved", index=True)  # Saved, Applied, Assessment, Interview, Selected, Rejected
    applied_date = Column(Date, nullable=True)
    interview_date = Column(Date, nullable=True)
    deadline = Column(Date, nullable=True, index=True)
    match_score = Column(Integer, nullable=True)
    next_action = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    job_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    internship = relationship("InternshipModel", back_populates="applications")


class ProfileModel(Base):
    __tablename__ = "profiles"

    id = Column(String(64), primary_key=True)
    email = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    university = Column(String(255), nullable=True)
    degree = Column(String(255), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    skills = Column(JSON, default=list)
    preferred_roles = Column(JSON, default=list)
    preferred_locations = Column(JSON, default=list)
    preferred_work_modes = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ResumeModel(Base):
    __tablename__ = "resumes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), nullable=True, index=True)
    filename = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    parsed_text = Column(Text, nullable=True)
    extracted_skills = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
