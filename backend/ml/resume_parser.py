"""
Resume PDF parser for the ML pipeline.
Extracts clean plain text, validates PDF integrity, and parses candidate qualifications.
"""
import re
import fitz  # PyMuPDF
from typing import Dict, Any, List, Optional

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

class MLResumeParseError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)

def extract_text_from_pdf(file_bytes: bytes, filename: str = "resume.pdf") -> str:
    """Validate PDF file and extract all text."""
    if not filename.lower().endswith(".pdf"):
        raise MLResumeParseError("INVALID_FILE_TYPE", "Only PDF resumes are supported.")
    if len(file_bytes) > MAX_FILE_SIZE:
        raise MLResumeParseError("FILE_TOO_LARGE", "Resume file exceeds 5MB limit.")
    if len(file_bytes) < 100:
        raise MLResumeParseError("EMPTY_PDF", "The uploaded file is empty or corrupted.")

    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as e:
        raise MLResumeParseError("CORRUPT_PDF", f"Failed to open PDF document: {e}")

    if doc.needs_pass:
        raise MLResumeParseError("ENCRYPTED_PDF", "Password-protected PDFs cannot be processed.")

    extracted_pages = []
    for page_idx in range(len(doc)):
        page = doc[page_idx]
        extracted_pages.append(page.get_text())

    doc.close()
    full_text = "\n".join(extracted_pages).strip()

    if len(full_text) < 50:
        raise MLResumeParseError(
            "SCANNED_PDF",
            "Resume contains too little text (may be an image/scanned PDF). Please provide a selectable text PDF."
        )

    # Clean text
    full_text = re.sub(r"[ \t]+", " ", full_text)
    full_text = re.sub(r"\n\s*\n\s*", "\n\n", full_text)
    return full_text

def extract_candidate_education(text: str) -> Dict[str, Any]:
    """Identify degrees, majors, and graduation years from resume text."""
    degree_patterns = [
        r"\b(B\.?Tech|B\.?E\.?|Bachelor of Technology|Bachelor of Engineering|B\.?S\.?|Bachelor of Science)\b",
        r"\b(M\.?Tech|M\.?E\.?|Master of Technology|Master of Engineering|M\.?S\.?|Master of Science)\b",
        r"\b(BCA|MCA|MBA|B\.?Com|Ph\.?D|Doctorate)\b",
    ]
    detected_degree = None
    for pattern in degree_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            detected_degree = match.group(0).strip()
            break

    # Graduation year
    years = re.findall(r"\b(20\d{2})\b", text)
    grad_year = None
    if years:
        valid_years = [int(y) for y in years if 2015 <= int(y) <= 2032]
        if valid_years:
            grad_year = max(valid_years)

    return {
        "degree": detected_degree,
        "graduation_year": grad_year,
    }
