"""
Resume PDF parser using PyMuPDF.
Extracts text and infers structured profile using regex and heuristics.
Does NOT invent missing information.
"""
import re
import fitz  # PyMuPDF
from typing import BinaryIO
from app.schemas.profile import ExtractedProfile

SKILL_KEYWORDS = [
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "swift",
    "kotlin", "r", "matlab", "scala", "ruby", "php", "sql", "nosql",
    "react", "nextjs", "next.js", "angular", "vue", "svelte", "node.js", "express",
    "django", "fastapi", "flask", "spring", "rails", "laravel",
    "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy", "matplotlib",
    "docker", "kubernetes", "aws", "azure", "gcp", "git", "linux", "bash",
    "mongodb", "postgresql", "mysql", "redis", "elasticsearch", "graphql",
    "machine learning", "deep learning", "nlp", "computer vision", "data science",
    "html", "css", "tailwind", "sass", "figma", "rest api", "microservices",
]

DEGREE_PATTERNS = [
    r"\b(B\.?Tech|B\.?E\.?|Bachelor of Technology|Bachelor of Engineering)\b",
    r"\b(M\.?Tech|M\.?E\.?|Master of Technology|Master of Engineering)\b",
    r"\b(B\.?Sc|Bachelor of Science)\b",
    r"\b(M\.?Sc|Master of Science)\b",
    r"\b(BCA|MCA|MBA|B\.?Com|M\.?Com|Ph\.?D)\b",
]

GRAD_YEAR_PATTERN = r"\b(20\d{2})\b"
CERT_KEYWORDS = ["certified", "certification", "certificate", "aws certified", "google certified", "coursera", "udemy"]

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

class ResumeParseError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)

def validate_and_extract_text(file_bytes: bytes, filename: str) -> str:
    """Validate PDF and extract raw text. Raises ResumeParseError on failure."""
    if not filename.lower().endswith(".pdf"):
        raise ResumeParseError("INVALID_FILE_TYPE", "Only PDF files are accepted.")
    if len(file_bytes) > MAX_FILE_SIZE:
        raise ResumeParseError("FILE_TOO_LARGE", "File exceeds 5 MB limit.")
    if len(file_bytes) < 100:
        raise ResumeParseError("EMPTY_PDF", "The uploaded file appears to be empty.")

    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception:
        raise ResumeParseError("INVALID_FILE_TYPE", "Could not open the file as a PDF.")

    if doc.needs_pass:
        raise ResumeParseError("ENCRYPTED_PDF", "This PDF is password-protected. Please remove the password and re-upload.")

    text = ""
    for page in doc:
        text += page.get_text()

    doc.close()

    if len(text.strip()) < 100:
        raise ResumeParseError(
            "SCANNED_PDF",
            "This PDF appears to be a scanned image. OCR is not supported. "
            "Please upload a text-based PDF resume."
        )

    return text

def parse_resume(file_bytes: bytes, filename: str) -> ExtractedProfile:
    """Main entry point. Returns extracted profile or raises ResumeParseError."""
    text = validate_and_extract_text(file_bytes, filename)
    return _extract_profile(text)

def _extract_profile(text: str) -> ExtractedProfile:
    text_lower = text.lower()

    # Skills
    found_skills = []
    for skill in SKILL_KEYWORDS:
        if skill in text_lower:
            found_skills.append(skill.title())

    # Deduplicate programming languages vs frameworks
    PROG_LANGS = {"Python", "Javascript", "Typescript", "Java", "C++", "C#", "Go",
                  "Rust", "Swift", "Kotlin", "R", "Matlab", "Scala", "Ruby", "Php",
                  "Sql", "Nosql", "Html", "Css"}
    prog_langs = [s for s in found_skills if s in PROG_LANGS]
    frameworks = [s for s in found_skills if s not in PROG_LANGS]

    # Degree
    degree = None
    for pattern in DEGREE_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            degree = match.group(0).strip()
            break

    # Graduation year — take the latest year found
    years = re.findall(GRAD_YEAR_PATTERN, text)
    grad_year = max(int(y) for y in years) if years else None
    if grad_year and grad_year > 2035:
        grad_year = None

    # Certifications
    certs = []
    for line in text.split("\n"):
        if any(kw in line.lower() for kw in CERT_KEYWORDS):
            cleaned = line.strip()
            if cleaned and len(cleaned) < 200:
                certs.append(cleaned)
    certs = list(dict.fromkeys(certs))[:5]

    # Projects — look for project title patterns
    project_pattern = re.findall(r"(?:project|built|developed|created)[:\s]+([A-Z][a-zA-Z\s]{5,50})", text)
    projects = list(dict.fromkeys(p.strip() for p in project_pattern))[:5]

    # Specialization heuristic
    spec = None
    spec_keywords = {
        "computer science": "Computer Science",
        "artificial intelligence": "Artificial Intelligence",
        "machine learning": "Machine Learning",
        "data science": "Data Science",
        "information technology": "Information Technology",
        "electronics": "Electronics",
        "electrical": "Electrical Engineering",
        "mechanical": "Mechanical Engineering",
        "civil": "Civil Engineering",
    }
    for kw, label in spec_keywords.items():
        if kw in text_lower:
            spec = label
            break

    # Career interests from objective/summary section
    interests = ""
    for section_kw in ["objective", "summary", "career goal", "about me"]:
        idx = text_lower.find(section_kw)
        if idx != -1:
            snippet = text[idx:idx+300].strip()
            interests = " ".join(snippet.split()[:30])
            break

    return ExtractedProfile(
        skills=list(dict.fromkeys(found_skills))[:20],
        programming_languages=prog_langs,
        frameworks=frameworks,
        certifications=certs,
        project_titles=projects,
        career_interests=interests,
        degree=degree,
        specialization=spec,
        graduation_year=grad_year,
    )
