# PRD.md — Product Requirements Document
# Internship Tracker AI

**Version:** 1.0 | **Status:** Approved for MVP
**Tagline:** Your Resume. Your Skills. Your Next Opportunity.

---

## 1. Problem Statement

Students face: fragmented internship discovery, manual resume-JD comparison, opaque matching, skill gap blindness, deadline mismanagement, and no unified application tracker.

---

## 2. Value Proposition

Upload a resume once. The platform extracts a structured skill profile, recommends relevant internships with transparent match scores, shows matched/missing skills, provides a JD analyzer, and tracks applications.

---

## 3. Target Users

- **Primary:** University student seeking internship
- **Secondary:** Fresher, career switcher
- **Admin:** Maintains internship listings (no student data access)

---

## 4. Core User Journeys

1. Sign up → upload resume → dashboard with recommendations
2. Discover internships → filter/search → view match breakdown
3. Paste JD into AI Analyzer → get structured extraction → save to DB
4. Track application: Saved → Applied → Assessment → Interview → Selected/Rejected
5. View deadlines and dashboard metrics
6. Edit profile, replace resume, delete account

---

## 5. Functional Requirements

### Auth
- Signup, login, logout via Supabase Auth
- Protected routes redirect unauthenticated users to /login
- Profile record created on first login
- Demo mode when credentials unavailable

### Resume Upload
- Accept PDF ≤ 5 MB
- Reject non-PDF, encrypted, empty, oversized files
- Extract: skills, education, projects, certifications, experience, interests (PyMuPDF)
- Show message for scanned PDFs (no OCR)
- User reviews and edits extracted data before saving
- Disclosure: "Resume text is processed by [Provider]"
- Replace and delete supported

### Internship Discovery & Matching
- Paginated list (20/page), keyword search, filters (location, mode, skills, stipend)
- Sort by: match score, deadline, newest
- Match score: required skills 40%, preferred skills 20%, education 20%, projects/exp 15%, location 5%
- Show: matched skills, missing skills, explanation
- Sample data clearly labeled "[Demo]"
- Official link opens new tab; never auto-marks applied

### AI Job Analyzer
- Text area up to 5,000 chars
- Structured extraction: title, company, required/preferred skills, responsibilities, eligibility, location, mode, compensation, deadline
- No fabrication; missing fields = null
- Demo mode if no AI key
- Save analyzed job to internship DB

### Application Tracking
- Statuses: Saved, Applied, Assessment, Interview, Selected, Rejected
- Kanban board + table view
- Status updates, notes, interview date, delete with confirmation
- Filter by status, company, date range

### Dashboard
- Cards: saved, applied, interviews, pending deadlines (real data)
- Status distribution chart, application timeline (30 days)
- Recent activity feed, top 3 recommendations, next 5 deadlines

### Deadlines
- List all upcoming + overdue deadlines
- No invented dates; shown only when stored

### Admin
- CRUD for internship listings
- Cannot access student profiles, resumes, or applications

---

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Security | HTTPS; secrets in env vars; RLS on all tables |
| Privacy | Resume files private; AI processing disclosed |
| Performance | Page load < 2s; API < 1s (non-AI) |
| Accessibility | WCAG 2.1 AA: keyboard nav, ARIA, contrast ≥ 4.5:1 |
| Responsive | 320px mobile → 2560px desktop |
| Reliability | Graceful degradation when backend/AI unavailable |

---

## 7. Pages

| Page | Route | Auth |
|---|---|---|
| Landing | / | No |
| Login | /login | No |
| Signup | /signup | No |
| Dashboard | /dashboard | Yes |
| Discover | /internships | Yes |
| Details | /internships/[id] | Yes |
| AI Analyzer | /analyzer | Yes |
| Applications | /applications | Yes |
| Deadlines | /deadlines | Yes |
| Profile | /profile | Yes |
| Settings | /settings | Yes |
| Admin | /admin | Admin |

---

## 8. Roles and Permissions

| Action | Unauth | Student | Admin |
|---|---|---|---|
| View landing / demo | ✅ | ✅ | ✅ |
| Upload resume | ❌ | ✅ | ❌ |
| Track applications | ❌ | ✅ | ❌ |
| Manage internship listings | ❌ | ❌ | ✅ |
| View student data | ❌ | ❌ | ❌ |

---

## 9. MVP Scope

**In:** Auth, resume upload/parsing, profile, matching, AI analyzer (with fallback), application tracking, dashboard, deadlines, admin CRUD.

**Out:** RAG/vectors/embeddings, trained ML model, OCR, websockets, payments, microservices.

---

## 10. Success Criteria

1. Student can sign up, upload PDF, see match score within 2 minutes
2. Recommendations are personalized by extracted skill profile
3. Application tracked from Saved to Selected/Rejected
4. AI analyzer returns structured output for any valid JD text
5. No cross-user data leakage in any test
6. App runs in demo mode without any env credentials
7. Core pages pass WCAG 2.1 AA contrast checks
