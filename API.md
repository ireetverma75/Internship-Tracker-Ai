# API.md — API Contracts
# Internship Tracker AI

Base URL: `http://localhost:8000/api`
Auth: `Authorization: Bearer <supabase_jwt>` on all protected routes.
Error format: `{"error": {"code": "ERROR_CODE", "message": "Human message", "details": {}}}`

---

## Health

### GET /health
No auth required.
Response 200: `{"status": "ok", "version": "1.0.0", "db": "connected", "ai": "demo|openai|gemini"}`

---

## Resume

### POST /resume/upload
**Auth:** Required  
**Content-Type:** multipart/form-data  
**Body:** `file` (PDF, max 5MB)  
**Response 200:**
```json
{
  "resume_id": "uuid",
  "parse_status": "parsed|scanned|failed",
  "extracted_profile": {
    "skills": ["Python", "React"],
    "programming_languages": ["Python", "JavaScript"],
    "frameworks": ["React", "FastAPI"],
    "education": {"degree": "B.Tech", "specialization": "CS", "graduation_year": 2025},
    "certifications": [],
    "project_titles": ["Resume Parser", "ML Dashboard"],
    "career_interests": "ML Engineering, Backend Development"
  },
  "message": "Resume parsed successfully"
}
```
**Errors:**
- 400: `FILE_TOO_LARGE`, `INVALID_FILE_TYPE`, `ENCRYPTED_PDF`, `EMPTY_PDF`
- 422: `SCANNED_PDF` (with helpful message)

### DELETE /resume
**Auth:** Required  
Deletes resume file from storage and clears resume metadata.  
Response 200: `{"message": "Resume deleted"}`

---

## Profile

### GET /profile
**Auth:** Required  
Returns authenticated user's profile.  
Response 200: Full profile object.

### PATCH /profile
**Auth:** Required  
**Body:** Partial profile fields (any subset).  
Validates: graduation_year is integer 2000–2035, work_mode in allowed values.  
Response 200: Updated profile.

---

## Internships

### GET /internships
**Auth:** Required  
**Query params:**
- `q` — keyword search (title, company, description, skills)
- `location` — filter by location string
- `work_mode` — remote|hybrid|onsite
- `skills` — comma-separated skill names
- `stipend_min` — integer
- `sort` — match_score|deadline|newest (default: match_score)
- `page` — default 1
- `per_page` — default 20, max 50

Response 200:
```json
{
  "items": [InternshipWithScore],
  "total": 142,
  "page": 1,
  "per_page": 20
}
```
Each item includes computed `match_score` and `match_details` based on user's profile.

### GET /internships/recommended
**Auth:** Required  
Returns top 10 internships by match score for authenticated user.  
Response 200: `{"items": [InternshipWithScore]}`

### GET /internships/{id}
**Auth:** Required  
Returns full internship + match details for authenticated user.  
Errors: 404 if not found or inactive.

### POST /internships
**Auth:** Required (Admin only)  
**Body:**
```json
{
  "company": "string",
  "title": "string",
  "description": "string",
  "required_skills": ["Python"],
  "preferred_skills": ["Docker"],
  "location": "Bangalore",
  "work_mode": "hybrid",
  "stipend_min": 20000,
  "stipend_max": 40000,
  "official_url": "https://...",
  "deadline": "2025-03-31",
  "degree_requirement": "B.Tech/B.E.",
  "experience_level": "entry"
}
```
Response 201: Created internship.  
Errors: 403 if not admin.

### PATCH /internships/{id}
**Auth:** Required (Admin only)  
Partial update. Response 200: Updated internship.

### DELETE /internships/{id}
**Auth:** Required (Admin only)  
Soft delete (sets is_active=false). Response 200: `{"message": "Deleted"}`

---

## Saved Internships

### GET /saved
**Auth:** Required  
Returns list of saved internship IDs and full objects.  
Response 200: `{"items": [Internship], "ids": ["uuid"]}`

### POST /saved/{internship_id}
**Auth:** Required  
Save an internship. Idempotent.  
Response 200: `{"saved": true}`

### DELETE /saved/{internship_id}
**Auth:** Required  
Remove from saved. Response 200: `{"saved": false}`

---

## Applications

### GET /applications
**Auth:** Required  
**Query params:** `status`, `q` (company/role search), `date_from`, `date_to`, `page`, `per_page`  
Response 200: `{"items": [Application], "total": int}`

### POST /applications
**Auth:** Required  
**Body:**
```json
{
  "internship_id": "uuid|null",
  "company_name": "string",
  "role_title": "string",
  "status": "saved",
  "applied_date": "2025-01-15|null",
  "interview_date": "2025-01-25|null",
  "deadline": "2025-02-01|null",
  "notes": "string|null",
  "external_url": "string|null"
}
```
Response 201: Created application.

### PATCH /applications/{id}
**Auth:** Required  
Owns the application (enforced server-side).  
Partial update. Response 200: Updated application.  
Errors: 403 if not owner, 404 if not found.

### DELETE /applications/{id}
**Auth:** Required (owner only)  
Hard delete with confirmation required client-side.  
Response 200: `{"message": "Deleted"}`

---

## AI Analyzer

### POST /analyze/job-description
**Auth:** Required  
**Rate limit:** 10 requests/minute per user  
**Body:** `{"text": "string (max 5000 chars)"}`  
Response 200:
```json
{
  "is_demo": false,
  "extracted": {
    "title": "string|null",
    "company": "string|null",
    "required_skills": ["Python", "SQL"],
    "preferred_skills": ["Spark"],
    "responsibilities": ["string"],
    "eligibility": "string|null",
    "location": "string|null",
    "work_mode": "string|null",
    "compensation": "string|null",
    "deadline": "string|null"
  },
  "match_preview": {
    "score": 72,
    "matched_skills": ["Python"],
    "missing_skills": ["SQL"]
  }
}
```
Errors: 400 `TEXT_TOO_SHORT` (<50 chars), `TEXT_TOO_LONG` (>5000), 503 `AI_PROVIDER_ERROR`

### POST /analyze/save-to-internships
**Auth:** Required  
Saves analyzed extraction as internship record (with source='analyzer').  
**Body:** AnalysisExtracted object  
Response 201: Created internship.

---

## Deadlines

### GET /deadlines
**Auth:** Required  
Returns combined deadlines from applications and saved internships.  
Response 200:
```json
{
  "upcoming": [{"type": "application|interview", "date": "...", "company": "...", "role": "..."}],
  "overdue": [...]
}
```

---

## Hugging Face Dataset Jobs

### GET /jobs
Query params: `query`, `job_title`, `company`, `job_type`, `skill`, `is_synthetic`, `page` (default 1), `limit` (default 20).  
Returns paginated list of jobs from the Hugging Face Jobs Tabular Dataset with extracted skills.  
Response 200:
```json
{
  "total": 391,
  "page": 1,
  "limit": 20,
  "total_pages": 20,
  "jobs": [
    {
      "id": "uuid",
      "job_title": "Mechanical Engineer",
      "company": "Lawrence Livermore National Laboratory",
      "job_type": "Engineering",
      "description": "...",
      "qualifications": "...",
      "duties": "...",
      "pay": "$140,700 - $214,032",
      "source": "huggingface_jobs_dataset",
      "is_synthetic": false,
      "created_at": "2026-11-05T...",
      "skills": ["System Design", "Linux"]
    }
  ],
  "job_types": ["Consulting", "Engineering", "Software Development"],
  "companies": ["Lawrence Livermore National Laboratory", ...]
}
```

### GET /jobs/{id}
Returns specific job by ID with extracted skills.  
Response 200: JobResponse object.  
Errors: 404 `NOT_FOUND`

### GET /jobs/stats
Returns dataset metrics: total jobs, real-world sample count, synthetic records count, and top categories.

### POST /jobs/sync
Triggers Hugging Face dataset synchronization.  
Query params: `split` ("original" | "augmented" | "all"), `max_records` (optional).  
Response 200: Sync summary with counts of inserted, skipped, and duplicates removed.

---

## AI Resume Matching & Recommendations

### POST /matching/match-job
Matches an uploaded PDF resume or resume text against a specific dataset job using TF-IDF vectorization and Cosine Similarity.  
Content-Type: `multipart/form-data`  
Form fields: `job_id` (required), `file` (PDF, optional), `resume_text` (optional).  
Response 200:
```json
{
  "extracted_candidate_skills": ["Python", "SQL", "Flask"],
  "total_skills_detected": 3,
  "match_result": {
    "job_id": "uuid",
    "job_title": "Python Developer Intern",
    "company": "TechCorp",
    "job_type": "Software Development",
    "pay": "$95,000 - $110,000",
    "is_synthetic": false,
    "match_score": 85.0,
    "tfidf_similarity": 0.38,
    "skill_overlap_ratio": 0.60,
    "matched_skills": ["Flask", "Python", "SQL"],
    "missing_skills": ["AWS", "Docker"],
    "recommendation": "Improve your Docker and AWS knowledge to strengthen your profile for this Python Developer Intern listing.",
    "qualification_match": "Candidate holds B.Tech, which aligns with undergraduate degree requirements."
  }
}
```

### POST /matching/match-text
Ad-hoc match of resume text directly against an arbitrary job description.  
Body: JSON `{ "resume_text": "...", "job_title": "...", "company": "...", "job_description": "...", "qualifications": "...", "duties": "..." }`  
Response 200: `JobMatchResult`

### POST /matching/batch-match
Evaluates an uploaded resume against all jobs in the database and returns ranked results.

### POST /recommendations/jobs
Ranks and recommends top matching jobs for an uploaded resume.  
Form fields: `file` (PDF, optional), `resume_text` (optional), `top_n` (default 10), `job_type` (optional), `include_synthetic` (default false).  
Response 200: List of recommended jobs with calculated scores and skill gaps.

### GET /recommendations/profile-based
Recommends jobs using saved profile skills and education.

---

## Error Codes Reference

| Code | HTTP | Meaning |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Insufficient role/ownership |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_ERROR` | 422 | Request body validation failed |
| `FILE_TOO_LARGE` | 400 | Resume > 5MB |
| `INVALID_FILE_TYPE` | 400 | Not a PDF |
| `ENCRYPTED_PDF` | 400 | Password-protected PDF |
| `SCANNED_PDF` | 422 | No extractable text |
| `TEXT_TOO_SHORT` | 400 | JD text too short |
| `AI_PROVIDER_ERROR` | 503 | External AI unavailable |
| `RATE_LIMITED` | 429 | Too many requests |
