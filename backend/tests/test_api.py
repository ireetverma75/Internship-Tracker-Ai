import pytest
import io
import fitz

@pytest.mark.asyncio
async def test_health_check(client):
    res = await client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["service"] == "Internship Tracker AI"

@pytest.mark.asyncio
async def test_get_profile(client):
    res = await client.get("/api/profile")
    assert res.status_code == 200
    data = res.json()
    assert "user_id" in data
    assert isinstance(data["skills"], list)

@pytest.mark.asyncio
async def test_update_profile(client):
    res = await client.patch("/api/profile", json={"graduation_year": 2026, "preferred_work_mode": "remote"})
    assert res.status_code == 200
    data = res.json()
    assert data["graduation_year"] == 2026
    assert data["preferred_work_mode"] == "remote"

@pytest.mark.asyncio
async def test_list_internships(client):
    res = await client.get("/api/internships")
    assert res.status_code == 200
    items = res.json()
    assert isinstance(items, list)
    assert len(items) > 0
    first = items[0]
    assert "company" in first
    assert "role" in first
    assert "match_score" in first

@pytest.mark.asyncio
async def test_filter_internships(client):
    res = await client.get("/api/internships?query=Google")
    assert res.status_code == 200
    items = res.json()
    assert any("Google" in item["company"] for item in items)

@pytest.mark.asyncio
async def test_get_internship_not_found(client):
    res = await client.get("/api/internships/nonexistent-id-12345")
    assert res.status_code == 404

@pytest.mark.asyncio
async def test_applications_lifecycle(client):
    # Create application
    payload = {
        "company": "Test Innovators Inc",
        "role": "Frontend Intern",
        "status": "Applied",
        "notes": "Referral via senior"
    }
    create_res = await client.post("/api/applications", json=payload)
    assert create_res.status_code == 200
    app_data = create_res.json()
    app_id = app_data["id"]
    assert app_data["company"] == "Test Innovators Inc"
    assert app_data["status"] == "Applied"

    # List applications
    list_res = await client.get("/api/applications")
    assert list_res.status_code == 200
    apps = list_res.json()
    assert any(a["id"] == app_id for a in apps)

    # Update application
    update_res = await client.patch(f"/api/applications/{app_id}", json={"status": "Interview", "notes": "Round 1 scheduled"})
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "Interview"

    # Delete application
    del_res = await client.delete(f"/api/applications/{app_id}")
    assert del_res.status_code == 200

    # Verify deleted
    get_res = await client.get(f"/api/applications/{app_id}")
    assert get_res.status_code == 404

@pytest.mark.asyncio
async def test_analyze_job_description_happy_path(client):
    jd_text = """
    Software Engineering Intern at TechCorp.
    Requirements: Proficiency in Python, SQL, Git, and Docker.
    Responsibilities: Build REST APIs and write automated tests.
    Location: Bangalore. Mode: Hybrid.
    """
    res = await client.post("/api/analyze-job", json={"description": jd_text})
    assert res.status_code == 200
    data = res.json()
    assert "role" in data
    assert "required_skills" in data
    assert "match_preview" in data

@pytest.mark.asyncio
async def test_analyze_job_description_empty_error(client):
    res = await client.post("/api/analyze-job", json={"description": "   "})
    assert res.status_code == 400

@pytest.mark.asyncio
async def test_resume_upload_invalid_type_error(client):
    files = {"file": ("resume.txt", b"plain text is not allowed", "text/plain")}
    res = await client.post("/api/resume/upload", files=files)
    assert res.status_code == 400

@pytest.mark.asyncio
async def test_resume_upload_valid_pdf(client):
    # Create valid in-memory PDF
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text(
        (50, 72),
        "John Doe\nEducation: B.Tech in Computer Science 2026\n"
        "Skills: Python, React, SQL, Git, Docker, Machine Learning\n"
        "Projects: Built an AI Internship Tracker web application.\n"
        "Certifications: AWS Certified Cloud Practitioner"
    )
    pdf_bytes = doc.tobytes()
    doc.close()

    files = {"file": ("resume.pdf", pdf_bytes, "application/pdf")}
    res = await client.post("/api/resume/upload", files=files)
    assert res.status_code == 200
    data = res.json()
    assert "resume_id" in data
    assert "extracted_profile" in data
    skills = data["extracted_profile"]["skills"]
    assert "Python" in skills or "React" in skills
