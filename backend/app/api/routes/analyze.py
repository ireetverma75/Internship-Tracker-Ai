"""AI Job Description Analyzer endpoint."""
from urllib.parse import urlparse
import ipaddress
from fastapi import APIRouter, HTTPException, status
from app.schemas.analysis import JobAnalysisRequest, JobAnalysisResponse
from app.services.job_analyzer import job_analyzer

router = APIRouter(tags=["AI Job Analyzer"])


def validate_safe_url(url: str):
    """Prevent SSRF attacks by rejecting local, private, or loopback IPs."""
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid URL scheme. Only HTTP and HTTPS are permitted."
        )
    hostname = parsed.hostname
    if not hostname:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid job URL."
        )
    if hostname.lower() in ("localhost", "127.0.0.1", "0.0.0.0", "::1"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Private/internal hostnames are prohibited."
        )
    try:
        ip = ipaddress.ip_address(hostname)
        if ip.is_private or ip.is_loopback or ip.is_link_local:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Private network addresses are prohibited."
            )
    except ValueError:
        # Hostname is a domain name, which is allowed
        pass


@router.post("/analyze-job", response_model=JobAnalysisResponse)
async def analyze_job(payload: JobAnalysisRequest):
    if payload.job_url:
        validate_safe_url(payload.job_url)

    if len(payload.description.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description text is too short. Please provide at least 10 characters."
        )

    result = await job_analyzer.analyze(payload)
    return result
