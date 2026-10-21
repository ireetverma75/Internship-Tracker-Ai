# ARCHITECTURE.md — Technical Architecture
# Internship Tracker AI

---

## 1. System Overview

One frontend. One backend. One database.

```
Browser → Next.js Frontend → FastAPI Backend → Supabase PostgreSQL
                ↓                   ↓
          Supabase Auth       AI Provider (OpenAI/Gemini)
          Supabase Storage    (optional, server-side only)
```

---

## 2. Frontend

**Framework:** Next.js 14+ (App Router)
**Language:** TypeScript (strict mode)
**Styling:** Tailwind CSS
**Components:** shadcn/ui + custom components
**Icons:** Lucide React
**Animation:** Framer Motion
**Charts:** Recharts
**Forms:** React Hook Form + Zod
**HTTP:** fetch with typed wrappers in lib/api.ts

### Directory structure
```
frontend/
  app/                    # Next.js App Router pages
    (auth)/               # login, signup (no layout)
    (app)/                # Protected pages with sidebar layout
      dashboard/
      internships/
      analyzer/
      applications/
      deadlines/
      profile/
      settings/
    admin/
    page.tsx              # Landing page
  components/
    ui/                   # shadcn/ui base components
    layout/               # Sidebar, Navbar, MobileDrawer, AppShell
    dashboard/            # Dashboard-specific widgets
    internships/          # InternshipCard, MatchScore, SkillBadge
    applications/         # KanbanBoard, ApplicationRow
    resume/               # UploadZone, ProfileForm
    analyzer/             # AnalyzerForm, ExtractionResult
  lib/
    api.ts                # Typed API client
    auth.ts               # Supabase auth helpers
    matching.ts           # Client-side match score display helpers
    utils.ts              # cn(), formatDate(), etc.
    demo-data.ts          # Clearly labeled demo fixtures
  hooks/
    use-profile.ts
    use-internships.ts
    use-applications.ts
  types/
    index.ts              # Shared TypeScript types
```

---

## 3. Backend

**Framework:** FastAPI
**Language:** Python 3.11+
**Validation:** Pydantic v2
**ORM:** SQLAlchemy 2.x (async) with Supabase PostgreSQL
**PDF parsing:** PyMuPDF (fitz)
**Testing:** pytest + httpx AsyncClient

### Directory structure
```
backend/
  app/
    main.py               # FastAPI app factory
    api/
      routes/
        health.py
        resume.py
        profile.py
        internships.py
        applications.py
        analyze.py
        admin.py
    core/
      config.py           # Settings from env vars
      auth.py             # JWT validation, current_user dependency
      security.py         # Input sanitization helpers
    db/
      database.py         # SQLAlchemy engine + session
      models.py           # ORM models
      seed.py             # Demo seed data
    schemas/
      profile.py
      internship.py
      application.py
      analysis.py
    services/
      resume_parser.py    # PyMuPDF extraction + profile inference
      matching.py         # Deterministic score algorithm
      ai_analyzer.py      # LLM provider adapter
      internship_provider.py  # Extensible data provider interface
  tests/
    conftest.py
    test_resume.py
    test_matching.py
    test_applications.py
    test_auth.py
```

---

## 4. Database

**Provider:** Supabase PostgreSQL
**Auth:** Supabase Auth (JWT)
**Storage:** Supabase Storage (private bucket for resumes)
**RLS:** Enabled on all user-owned tables

---

## 5. Authentication and Authorization Flow

```
1. User logs in via Supabase Auth (client SDK)
2. Supabase returns JWT access token
3. Frontend stores token in memory / secure cookie
4. Every API request includes Authorization: Bearer <token>
5. Backend validates JWT with Supabase JWT secret
6. current_user dependency extracts user_id from validated token
7. All DB queries scoped to user_id — never from request body
8. RLS enforces same rules at DB level as second defense layer
```

**Rules:**
- user_id NEVER taken from request body; always from validated JWT
- Admin role stored in profiles.role column; checked server-side
- Forbidden responses return 403, not 404 (no resource enumeration for own resources)

---

## 6. AI Provider Abstraction

```python
# services/ai_analyzer.py
class AIAnalyzerService:
    def analyze_job_description(self, text: str) -> AnalysisResult:
        if not settings.AI_API_KEY:
            return self._demo_analysis(text)
        return self._call_provider(text)

    def _call_provider(self, text: str) -> AnalysisResult:
        # OpenAI or Gemini depending on AI_PROVIDER setting
        # Returns validated Pydantic model
        # Validates all fields; null for missing, never invented
```

Provider configured via `AI_PROVIDER` env var: `openai` | `gemini`
Falls back to deterministic demo if `AI_API_KEY` is absent.
API key never sent to frontend.

---

## 7. Resume Parsing Flow

```
1. Frontend uploads PDF via multipart/form-data to POST /api/resume/upload
2. Backend validates: file type, size ≤ 5MB, not encrypted
3. PyMuPDF extracts raw text
4. If text < 100 chars → return SCANNED_PDF error
5. Profile extractor runs regex + heuristics on raw text
6. Returns structured ExtractedProfile Pydantic model
7. File optionally stored in Supabase Storage (private)
8. Profile saved to profiles table
```

---

## 8. Matching Algorithm

Deterministic. No ML. No embeddings.

```
score = (
  required_skill_overlap * 0.40 +
  preferred_skill_overlap * 0.20 +
  education_match * 0.20 +
  project_experience_score * 0.15 +
  location_preference_match * 0.05
) * 100

required_skill_overlap = |resume_skills ∩ required_skills| / |required_skills|
# Missing information → that component contributes 0, not penalized beyond weight
```

Documented in matching.py with comments. Score = profile relevance estimate, not offer probability.

---

## 9. Error Handling

**Backend:**
- All errors return `{"error": {"code": "...", "message": "...", "details": {...}}}`
- Validation errors: 422 with field-level detail
- Auth errors: 401 (missing/invalid token), 403 (forbidden)
- Not found: 404
- AI provider error: 503 with fallback indicator
- Never expose stack traces in production

**Frontend:**
- React error boundaries on all page-level components
- API errors surfaced as toast + inline message
- Skeleton → error state (never blank)
- Retry buttons for transient failures

---

## 10. Environment Configuration

```
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# backend/.env
DATABASE_URL=postgresql+asyncpg://...
SUPABASE_JWT_SECRET=...
AI_PROVIDER=openai          # openai | gemini
AI_API_KEY=                 # leave empty for demo mode
SUPABASE_STORAGE_URL=...
SUPABASE_SERVICE_KEY=...
CORS_ORIGINS=http://localhost:3000
```

---

## 11. Testing Strategy

| Layer | Tool | Coverage target |
|---|---|---|
| Backend unit | pytest | Matching algorithm, resume parser, schemas |
| Backend integration | pytest + httpx | All API endpoints |
| Frontend unit | Jest + RTL | Utility functions, hooks |
| E2E | Manual checklist (Playwright optional) | Core user journeys |

---

## 12. Deployment

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render or Railway |
| Database | Supabase |
| Resume storage | Supabase Storage |
| Auth | Supabase Auth |
