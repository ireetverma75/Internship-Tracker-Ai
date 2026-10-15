"""Unit and integration tests for backend endpoints and services."""
import pytest
import io
import fitz


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Internship Tracker" in data["service"]


def test_internships_crud(client):
    # 1. List seeded internships
    response = client.get("/api/internships")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 4

    # 2. Filter by search query
    response_search = client.get("/api/internships?query=Microsoft")
    assert response_search.status_code == 200
    search_results = response_search.json()
    assert any(i["company"] == "Microsoft" for i in search_results)

    # 3. Create new internship
    new_data = {
        "company": "Test Innovators Inc",
        "role": "Full Stack AI Developer Intern",
        "description": "Building interactive Next.js interfaces with FastAPI backends.",
        "location": "Boston, MA",
        "work_mode": "Hybrid",
        "stipend": "$45/hr",
        "required_skills": ["Python", "React", "TypeScript"],
        "preferred_skills": ["Docker", "PostgreSQL"],
        "eligibility": "Junior or Senior university students.",
        "is_saved": True
    }
    create_res = client.post("/api/internships", json=new_data)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["company"] == "Test Innovators Inc"
    created_id = created["id"]

    # 4. Fetch created internship
    get_res = client.get(f"/api/internships/{created_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == created_id

    # 5. Update internship
    patch_res = client.patch(f"/api/internships/{created_id}", json={"stipend": "$50/hr"})
    assert patch_res.status_code == 200
    assert patch_res.json()["stipend"] == "$50/hr"

    # 6. Delete internship
    del_res = client.delete(f"/api/internships/{created_id}")
    assert del_res.status_code == 200

    # 7. Verify deletion
    verify_res = client.get(f"/api/internships/{created_id}")
    assert verify_res.status_code == 404


def test_applications_lifecycle(client):
    # 1. List applications
    list_res = client.get("/api/applications")
    assert list_res.status_code == 200
    apps = list_res.json()
    assert len(apps) >= 3

    # 2. Create application
    new_app = {
        "company": "Anthropic",
        "role": "Prompt & Safety Engineering Intern",
        "status": "Applied",
        "match_score": 89,
        "next_action": "Submit research writing sample",
        "notes": "Application sent via university careers portal"
    }
    create_res = client.post("/api/applications", json=new_app)
    assert create_res.status_code == 201
    app_data = create_res.json()
    app_id = app_data["id"]
    assert app_data["status"] == "Applied"

    # 3. Transition status to Interview
    patch_res = client.patch(f"/api/applications/{app_id}", json={"status": "Interview", "interview_date": "2026-11-05"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Interview"


def test_job_analyzer_endpoint(client):
    # Valid job description
    job_text = (
        "Software Engineering Intern at Atlassian. "
        "We are looking for students enrolled in a Bachelor's degree in Computer Science. "
        "Required skills include Python, React, TypeScript, and SQL. "
        "Location: Austin, TX. Work mode: Remote. "
        "Stipend: $48/hour. "
        "Apply by December 1, 2026."
    )
    res = client.post("/api/analyze-job", json={"description": job_text})
    assert res.status_code == 200
    data = res.json()
    assert "role" in data
    assert "required_skills" in data
    assert any("Python" in s for s in data["required_skills"])
    assert data["work_mode"] in ("Remote", "Hybrid", "On-site")
    assert data["is_demo"] is True  # Deterministic fallback when no live LLM key

    # Too short input error handling
    bad_res = client.post("/api/analyze-job", json={"description": "Too short"})
    assert bad_res.status_code in (400, 422)


def test_job_analyzer_ssrf_protection(client):
    # Private IP should be blocked
    res = client.post("/api/analyze-job", json={
        "description": "Standard job posting text describing an internship position.",
        "job_url": "http://127.0.0.1:8080/internal/admin"
    })
    assert res.status_code == 400
    assert "prohibited" in res.json()["detail"].lower()


def test_resume_matching_algorithm(client):
    resume_text = (
        "Jane Doe\n"
        "B.S. in Computer Science at University of California, Berkeley. GPA 3.85.\n"
        "Technical Skills: Python, TypeScript, React, PyTorch, Docker, Git, SQL.\n"
        "Experience: Software Engineering Project: Built full-stack platform serving 5,000 users.\n"
        "Engineered scalable microservices with Python and Docker containers."
    )
    req_payload = {
        "resume_text": resume_text,
        "job_role": "Full Stack AI Developer Intern",
        "job_company": "Innovative AI Labs",
        "required_skills": ["Python", "React", "TypeScript", "Docker"],
        "preferred_skills": ["PyTorch", "Kubernetes"],
        "job_description": "We are seeking a talented full-stack engineering intern with experience in Python and React."
    }
    res = client.post("/api/resume/match", json=req_payload)
    assert res.status_code == 200
    data = res.json()
    assert 60 <= data["match_score"] <= 100
    assert "Python" in data["matched_required_skills"]
    assert "React" in data["matched_required_skills"]
    assert "TypeScript" in data["matched_required_skills"]
    assert "scoring_explanation" in data
    assert len(data["resume_improvement_suggestions"]) > 0


def test_resume_pdf_parser_with_in_memory_pdf(client):
    # Generate a small valid PDF in memory using PyMuPDF
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), "Alex River\nSoftware Engineering Intern Candidate\nSkills: Python, TypeScript, React, Docker")
    pdf_bytes = doc.tobytes()
    doc.close()

    files = {"file": ("resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    res = client.post("/api/resume/parse", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["filename"] == "resume.pdf"
    assert data["page_count"] == 1
    assert "Python" in data["detected_skills"]
    assert "Alex River" in data["extracted_text"]
