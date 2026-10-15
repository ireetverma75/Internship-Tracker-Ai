"""Resume PDF text extraction service using PyMuPDF."""
import re
from typing import List, Tuple
import fitz  # PyMuPDF
from fastapi import HTTPException, UploadFile, status
from app.core.config import settings
from app.schemas.resume import ResumeParseResponse
from app.services.job_analyzer import COMMON_SKILLS


class ResumeParserService:
    def __init__(self):
        self.max_size = settings.MAX_RESUME_SIZE_MB * 1024 * 1024

    async def parse_pdf(self, file: UploadFile) -> ResumeParseResponse:
        # 1. Validate content type and filename
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF documents are supported. Please upload a .pdf file."
            )

        # 2. Read bytes with size limit check
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty (0 bytes)."
            )
        if len(contents) > self.max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum allowed size of {settings.MAX_RESUME_SIZE_MB}MB."
            )

        # 3. Open with PyMuPDF
        try:
            doc = fitz.open(stream=contents, filetype="pdf")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Unable to open document as a valid PDF. File may be corrupted."
            )

        # 4. Check encryption
        if doc.is_encrypted:
            return ResumeParseResponse(
                filename=file.filename,
                page_count=len(doc),
                char_count=0,
                word_count=0,
                extracted_text="",
                detected_skills=[],
                is_encrypted=True,
                warning="PDF is password-protected or encrypted. Please remove password protection and try again."
            )

        page_count = len(doc)
        full_text_parts: List[str] = []

        for page_num in range(page_count):
            page = doc.load_page(page_num)
            text = page.get_text()
            if text:
                full_text_parts.append(text)

        doc.close()

        extracted_text = "\n".join(full_text_parts).strip()
        char_count = len(extracted_text)
        words = extracted_text.split()
        word_count = len(words)

        warning = None
        if char_count == 0:
            warning = (
                "Scanned image-only PDF detected. PyMuPDF extracts embedded digital text; "
                "optical character recognition (OCR) is not enabled on this server."
            )

        # Detect skills from resume text
        detected_skills = self._extract_skills(extracted_text)

        return ResumeParseResponse(
            filename=file.filename,
            page_count=page_count,
            char_count=char_count,
            word_count=word_count,
            extracted_text=extracted_text,
            detected_skills=detected_skills,
            is_encrypted=False,
            warning=warning
        )

    def _extract_skills(self, text: str) -> List[str]:
        if not text:
            return []
        text_lower = text.lower()
        found = []
        for skill in COMMON_SKILLS:
            pattern = rf"(?<![\w#+]){re.escape(skill.lower())}(?![\w#+])"
            if re.search(pattern, text_lower):
                found.append(skill)
        return sorted(list(set(found)))


resume_parser = ResumeParserService()
