"""
Preprocessing and normalization module for Hugging Face Jobs Tabular Dataset.
Normalizes columns, cleans text, handles missing values, detects duplicates,
and tags synthetic records.
"""
import re
import unicodedata
import hashlib
from typing import List, Dict, Any, Tuple

# Mapping raw Hugging Face dataset column names to standardized schema fields
COLUMN_MAPPING = {
    "Job Type": "job_type",
    "job type": "job_type",
    "Description": "description",
    "description": "description",
    "qualifications": "qualifications",
    "Qualifications": "qualifications",
    "Duties": "duties",
    "duties": "duties",
    "Pay": "pay",
    "pay": "pay",
    "Company": "company",
    "company": "company",
    "Job title": "job_title",
    "job title": "job_title",
    "Job Title": "job_title",
}

def clean_text(text: Any) -> str:
    """Normalize text encoding, strip excessive whitespace, and handle nulls."""
    if text is None:
        return ""
    if not isinstance(text, str):
        text = str(text)

    # Normalize unicode characters (e.g., non-breaking spaces, curly quotes)
    text = unicodedata.normalize("NFKD", text)

    # Replace common formatting artifacts
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n\s*\n\s*\n+", "\n\n", text)
    return text.strip()

def normalize_row(raw_row: Dict[str, Any], is_synthetic: bool = False) -> Dict[str, Any]:
    """Normalize a single dataset row into the standardized schema."""
    normalized: Dict[str, Any] = {
        "job_title": "",
        "company": "",
        "job_type": "Other",
        "description": "",
        "qualifications": "",
        "duties": "",
        "pay": "",
        "source": "huggingface_jobs_dataset",
        "is_synthetic": is_synthetic,
    }

    for raw_col, val in raw_row.items():
        standard_col = COLUMN_MAPPING.get(raw_col, raw_col.lower().replace(" ", "_"))
        if standard_col in normalized:
            normalized[standard_col] = clean_text(val)

    # Default fallbacks for required title & company
    if not normalized["job_title"]:
        normalized["job_title"] = "General Position"
    if not normalized["company"]:
        normalized["company"] = "Confidential Employer"
    if not normalized["job_type"]:
        normalized["job_type"] = "General"

    return normalized

def generate_dedup_key(job: Dict[str, Any]) -> str:
    """Generate a stable hash key to detect duplicate job listings."""
    title_norm = re.sub(r"[^\w\s]", "", job.get("job_title", "").lower()).strip()
    company_norm = re.sub(r"[^\w\s]", "", job.get("company", "").lower()).strip()
    # Use first 150 chars of description to distinguish same title at company with different details
    desc_snippet = clean_text(job.get("description", ""))[:150].lower()

    raw_key = f"{title_norm}::{company_norm}::{desc_snippet}"
    return hashlib.md5(raw_key.encode("utf-8")).hexdigest()

def preprocess_dataset(
    raw_records: List[Dict[str, Any]],
    is_synthetic: bool = False
) -> Tuple[List[Dict[str, Any]], int]:
    """
    Preprocess and deduplicate a list of raw dataset records.
    Returns: (preprocessed_records, duplicates_removed_count)
    """
    seen_keys = set()
    cleaned_records = []
    duplicates_count = 0

    for raw_row in raw_records:
        norm_row = normalize_row(raw_row, is_synthetic=is_synthetic)
        dedup_key = generate_dedup_key(norm_row)

        if dedup_key in seen_keys:
            duplicates_count += 1
            continue

        seen_keys.add(dedup_key)
        cleaned_records.append(norm_row)

    return cleaned_records, duplicates_count
