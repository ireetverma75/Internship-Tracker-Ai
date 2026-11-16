from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class JobBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    job_title: str = Field(..., description="Job designation or title")
    company: str = Field(..., description="Company or hiring entity")
    job_type: Optional[str] = Field(None, description="Category or industry domain of the job")
    description: Optional[str] = Field(None, description="Comprehensive job description")
    qualifications: Optional[str] = Field(None, description="Required education, experience, and qualifications")
    duties: Optional[str] = Field(None, description="Responsibilities and primary tasks")
    pay: Optional[str] = Field(None, description="Compensation range or hourly rate if specified")
    source: str = Field(default="huggingface_jobs_dataset", description="Source data origin")
    is_synthetic: bool = Field(default=False, description="Flag indicating if the job was synthetically generated")

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: str
    created_at: datetime
    skills: List[str] = Field(default_factory=list, description="Extracted key skills from description and qualifications")

class JobListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    jobs: List[JobResponse]
    job_types: List[str] = Field(default_factory=list, description="List of unique job types available for filtering")
    companies: List[str] = Field(default_factory=list, description="List of top companies available for filtering")

class SkillMatchBreakdown(BaseModel):
    skill: str
    in_resume: bool
    category: Optional[str] = None

class JobMatchResult(BaseModel):
    job_id: str
    job_title: str
    company: str
    job_type: Optional[str] = None
    pay: Optional[str] = None
    is_synthetic: bool = False
    match_score: float = Field(..., description="Calculated match percentage (0 - 100)")
    tfidf_similarity: float = Field(..., description="Cosine similarity score (0 - 1)")
    skill_overlap_ratio: float = Field(..., description="Ratio of matched skills to total required job skills")
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    recommendation: str = Field(..., description="Actionable improvement suggestion based on missing skills")
    qualification_match: Optional[str] = Field(None, description="Comparison of candidate education/qualifications against job")

class ResumeMatchResponse(BaseModel):
    extracted_candidate_skills: List[str]
    total_skills_detected: int
    match_result: JobMatchResult

class BatchMatchResponse(BaseModel):
    total_evaluated: int
    extracted_candidate_skills: List[str]
    matches: List[JobMatchResult]

class RecommendationResponse(BaseModel):
    total_recommendations: int
    extracted_candidate_skills: List[str]
    recommendations: List[JobMatchResult]

class DatasetSyncResponse(BaseModel):
    status: str
    split: str
    total_loaded: int
    duplicates_removed: int
    records_inserted: int
    records_updated: int
    total_jobs_in_db: int
