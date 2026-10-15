"""Resume Parsing and AI Matching endpoints."""
from fastapi import APIRouter, File, HTTPException, UploadFile, status
from app.schemas.resume import ResumeParseResponse, ResumeMatchRequest, ResumeMatchResponse
from app.services.resume_parser import resume_parser
from app.services.matching import resume_matching

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post("/parse", response_model=ResumeParseResponse)
async def parse_resume_pdf(file: UploadFile = File(...)):
    """Extract text and detected technical skills from uploaded PDF resume."""
    return await resume_parser.parse_pdf(file)


@router.post("/match", response_model=ResumeMatchResponse)
async def match_resume_to_job(payload: ResumeMatchRequest):
    """Compare extracted resume content against target role and skill requirements."""
    if len(payload.resume_text.strip()) < 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text is too brief to evaluate. Please provide comprehensive resume text."
        )

    return await resume_matching.match(payload)
