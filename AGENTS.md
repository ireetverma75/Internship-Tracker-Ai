# AGENTS.md — Coding Rules for AI Agents
# Internship Tracker AI

This file governs all AI agent work on this codebase. Every agent must read this file before making any changes.

---

## 1. Pre-Work Requirements

Before modifying any file:
1. Inspect the existing file content
2. Check for related files that may be affected
3. Read the relevant section of PRD.md, DESIGN.md, ARCHITECTURE.md, DATABASE.md, or API.md
4. Identify existing patterns and reuse them

---

## 2. Core Rules

### Never do these things
- Do not claim a feature is implemented until it is tested and confirmed working
- Do not fabricate API responses, match scores, or successful integrations
- Do not silently alter database schema without a migration file
- Do not expose secrets or API keys in frontend code or logs
- Do not use client-supplied user IDs for authorization (always use JWT)
- Do not trust request body for role claims
- Do not rewrite files unrelated to the current task
- Do not suppress errors to make tests pass
- Do not remove tests to fix failures
- Do not invent resume data that wasn't in the PDF
- Do not store resume raw text in the database
- Do not make resume files publicly accessible

### Always do these things
- Keep the application runnable at all times
- Handle loading, empty, error, and success states for every UI feature
- Validate all external input with Pydantic (backend) and Zod (frontend)
- Use environment variables for all secrets
- Enforce authorization on the server, not just the client
- Add or update tests for meaningful behavior changes
- Update documentation (PRD, API, DATABASE) when behavior changes
- Follow DESIGN.md for all visual decisions

---

## 3. TypeScript Rules

- Strict mode always enabled (`"strict": true` in tsconfig)
- No `any` types without a comment explaining why
- All API response types defined in `types/index.ts`
- Props interfaces defined per component
- No implicit returns in async functions

---

## 4. Python Rules

- Python 3.11+
- All endpoints use async/await
- All request/response models defined as Pydantic v2 models
- No bare `except:` — always specify exception type
- Environment config only via `core/config.py` (pydantic-settings)
- Never print sensitive data to logs

---

## 5. Naming Conventions

| Element | Convention | Example |
|---|---|---|
| TS files | kebab-case | `internship-card.tsx` |
| TS components | PascalCase | `InternshipCard` |
| TS hooks | camelCase with use prefix | `useApplications` |
| TS types | PascalCase | `Application` |
| Python files | snake_case | `resume_parser.py` |
| Python classes | PascalCase | `ResumeParser` |
| Python functions | snake_case | `extract_skills` |
| DB columns | snake_case | `user_id`, `created_at` |
| API routes | kebab-case | `/job-description` |
| Env vars | UPPER_SNAKE_CASE | `AI_API_KEY` |

---

## 6. Component Rules

- One component per file
- Components should be focused (< 200 lines is a guideline)
- Reuse existing UI components from `components/ui/` before creating new ones
- Follow DESIGN.md color tokens; no hardcoded hex values in components
- All interactive elements must have keyboard support and visible focus state
- All images need descriptive alt text

---

## 7. Security Rules

- Validate file uploads: type, size, content
- Sanitize all text inputs that may be rendered as HTML
- Use parameterized queries only (SQLAlchemy ORM / Supabase client)
- Rate-limit AI endpoints
- Never log JWT tokens, passwords, or raw resume text
- Use signed URLs for any file download (max 15-min expiry)

---

## 8. Testing Rules

- Write tests alongside feature implementation, not after
- Tests must pass before marking feature complete
- Backend: at least one happy-path and one error-path test per endpoint
- Frontend: utility functions and complex hooks should have unit tests
- Test auth: verify that unauthenticated requests return 401 and cross-user requests return 403
- Do not mock the entire database layer in integration tests; use test database

---

## 9. Git Discipline

- Commit after each working, tested unit of change
- Commit message format: `type(scope): description`
  - types: feat, fix, refactor, test, docs, chore
  - examples: `feat(resume): add PDF upload endpoint`, `fix(auth): redirect on 401`
- Never commit .env files, API keys, or node_modules
- Never commit broken code to main

---

## 10. Documentation Rules

- Update API.md when adding or changing an endpoint
- Update DATABASE.md when changing the schema
- Add a migration file for every schema change
- Update PRD.md assumptions section when product decisions change
- Keep README.md instructions accurate and runnable

---

## 11. Demo Mode Rules

- Demo mode must be clearly labeled in the UI ("Demo Mode" banner)
- Demo data must be realistic but clearly fictional (no real companies contacted)
- Demo internships must have `is_demo: true` in the database
- AI demo output must be labeled `"is_demo": true` in the API response
- Do not pretend demo authentication is secure account authentication

---

## 12. Forbidden Dependencies

- No RAG libraries (llama-index, langchain vector stores)
- No vector database clients (Pinecone, Weaviate, Qdrant)
- No separately trained ML models
- No unnecessary microservices
- No client-side API key exposure
