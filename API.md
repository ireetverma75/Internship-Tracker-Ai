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
