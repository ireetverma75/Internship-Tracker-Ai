import pytest
from dataset.loader import load_raw_dataset, inspect_dataset_splits
from dataset.preprocessing import preprocess_dataset, normalize_row
from ml.skill_extractor import extract_skills_from_text, extract_skills_from_job, analyze_skill_gap
from ml.job_matcher import compute_tfidf_similarity, match_resume_to_job
from ml.recommendation import recommend_jobs_for_resume

def test_dataset_loader_splits():
    """Verify loading of both original (391) and augmented (1600) splits."""
    orig = load_raw_dataset("original")
    assert len(orig) == 391
    assert "Job title" in orig[0] or "job_title" in orig[0]
    assert "Company" in orig[0] or "company" in orig[0]

    aug = load_raw_dataset("augmented")
    assert len(aug) == 1600

    info = inspect_dataset_splits()
    assert info["splits"]["original"]["count"] == 391
    assert info["splits"]["augmented"]["count"] == 1600
    assert info["splits"]["augmented"]["is_synthetic"] is True

def test_preprocessing_and_deduplication():
    """Verify column normalization, deduplication, and is_synthetic tagging."""
    raw_sample = [
        {
            "Job Type": "Software Development",
            "Description": "Looking for a Python and React developer.",
            "qualifications": "BS in Computer Science. Experience with Docker.",
            "Duties": "Build REST APIs and maintain microservices.",
            "Pay": "$100,000 - $120,000",
            "Company": "Tech Innovations Corp",
            "Job title": "Full Stack Engineer"
        },
        # Duplicate row
        {
            "Job Type": "Software Development",
            "Description": "Looking for a Python and React developer.",
            "qualifications": "BS in Computer Science. Experience with Docker.",
            "Duties": "Build REST APIs and maintain microservices.",
            "Pay": "$100,000 - $120,000",
            "Company": "Tech Innovations Corp",
            "Job title": "Full Stack Engineer"
        },
        # Different row
        {
            "Job Type": "Data Science",
            "Description": "Train machine learning models with PyTorch and Pandas.",
            "qualifications": "MS in Data Science.",
            "Duties": "Run data analysis pipelines.",
            "Pay": "$110,000",
            "Company": "DataSphere Labs",
            "Job title": "Data Scientist"
        }
    ]

    cleaned, duplicates_removed = preprocess_dataset(raw_sample, is_synthetic=True)
    assert len(cleaned) == 2
    assert duplicates_removed == 1

    first = cleaned[0]
    assert first["job_title"] == "Full Stack Engineer"
    assert first["company"] == "Tech Innovations Corp"
    assert first["is_synthetic"] is True
    assert first["source"] == "huggingface_jobs_dataset"

def test_skill_extraction_engine():
    """Verify NLP skill extraction from candidate resumes and job descriptions."""
    sample_resume = """
    Software Engineer with 2 years of experience.
    Proficient in Python, JavaScript, TypeScript, React, Docker, and PostgreSQL.
    Familiar with AWS services (EC2, S3) and Git version control.
    Built automated CI/CD pipelines and REST APIs using FastAPI.
    """
    skills = extract_skills_from_text(sample_resume)
    assert "Python" in skills
    assert "React" in skills
    assert "Docker" in skills
    assert "PostgreSQL" in skills
    assert "FastAPI" in skills
    assert "AWS" in skills
    assert "Git" in skills
    assert "CI/CD" in skills

    # Skill gap analysis
    candidate_skills = ["Python", "SQL", "Flask"]
    required_skills = ["Python", "SQL", "Flask", "Docker", "AWS"]
    matched, missing, ratio = analyze_skill_gap(candidate_skills, required_skills)
    assert matched == ["Flask", "Python", "SQL"]
    assert missing == ["AWS", "Docker"]
    assert ratio == 0.6

def test_tfidf_cosine_and_match_scoring():
    """Verify TF-IDF cosine similarity calculation and deterministic match scoring."""
    resume_text = """
    Data Analyst with strong experience in Python, Pandas, SQL, Tableau, and Machine Learning.
    Created predictive models and interactive dashboards for marketing optimization.
    """
    job = {
        "id": "job-test-1",
        "job_title": "Data Analyst Intern",
        "company": "Analytics Hub",
        "job_type": "Data Science",
        "description": "Seeking a Data Analyst Intern proficient in Python, SQL, and Pandas.",
        "qualifications": "Bachelors degree in STEM. Knowledge of Tableau and Machine Learning is a plus.",
        "duties": "Perform statistical data analysis and build business intelligence dashboards.",
        "pay": "$35/hr",
        "is_synthetic": False
    }

    match_res = match_resume_to_job(resume_text, job)
    assert match_res["match_score"] > 60.0
    assert match_res["tfidf_similarity"] > 0.1
    assert "Python" in match_res["matched_skills"]
    assert "SQL" in match_res["matched_skills"]
    assert "recommendation" in match_res
    assert len(match_res["recommendation"]) > 10

def test_recommendation_engine():
    """Verify recommendation ranking based on resume match scores."""
    resume_text = "Proficient in Python, Django, REST API, PostgreSQL, and Git."
    jobs = [
        {
            "id": "1",
            "job_title": "Python Backend Developer",
            "company": "Alpha Tech",
            "job_type": "Engineering",
            "description": "Develop Python web applications with Django and REST APIs.",
            "qualifications": "Experience with PostgreSQL and Git.",
            "duties": "Maintain database schemas.",
            "pay": "$120,000",
            "is_synthetic": False
        },
        {
            "id": "2",
            "job_title": "iOS Mobile Developer",
            "company": "Beta Mobile",
            "job_type": "Mobile",
            "description": "Build native iOS apps using Swift and Xcode.",
            "qualifications": "App Store publishing experience.",
            "duties": "Implement UI layouts.",
            "pay": "$115,000",
            "is_synthetic": False
        }
    ]

    rec = recommend_jobs_for_resume(resume_text, jobs, top_n=2)
    assert rec["total_recommendations"] == 2
    top_match = rec["recommendations"][0]
    assert top_match["job_title"] == "Python Backend Developer"
    assert top_match["match_score"] > rec["recommendations"][1]["match_score"]

@pytest.mark.asyncio
async def test_api_jobs_search_and_pagination(client):
    """Test GET /api/jobs with filters, search, and pagination."""
    res = await client.get("/api/jobs?limit=5")
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "jobs" in data
    assert "job_types" in data
    assert len(data["jobs"]) <= 5

    if data["total"] > 0:
        first_job = data["jobs"][0]
        assert "id" in first_job
        assert "job_title" in first_job
        assert "company" in first_job
        assert "skills" in first_job

        # Test GET /api/jobs/{id}
        job_id = first_job["id"]
        detail_res = await client.get(f"/api/jobs/{job_id}")
        assert detail_res.status_code == 200
        detail = detail_res.json()
        assert detail["id"] == job_id
        assert detail["company"] == first_job["company"]

@pytest.mark.asyncio
async def test_api_job_not_found(client):
    """Test GET /api/jobs/{id} with nonexistent ID returns 404."""
    res = await client.get("/api/jobs/nonexistent-id-999999")
    assert res.status_code == 404

@pytest.mark.asyncio
async def test_api_jobs_stats(client):
    """Test GET /api/jobs/stats analytics endpoint."""
    res = await client.get("/api/jobs/stats")
    assert res.status_code == 200
    stats = res.json()
    assert "total_jobs" in stats
    assert "original_real_world_jobs" in stats
    assert "augmented_synthetic_jobs" in stats

@pytest.mark.asyncio
async def test_api_matching_match_text(client):
    """Test POST /api/matching/match-text."""
    payload = {
        "resume_text": "Experienced Python and SQL engineer with Docker and AWS experience.",
        "job_title": "Python Cloud Engineer",
        "company": "CloudCorp",
        "job_description": "We are seeking a Python engineer with SQL, Docker, and AWS skills.",
        "qualifications": "Bachelors in Computer Science.",
        "duties": "Deploy containerized applications."
    }
    res = await client.post("/api/matching/match-text", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["match_score"] > 60
    assert "Python" in data["matched_skills"]
    assert "Docker" in data["matched_skills"]
    assert "recommendation" in data

@pytest.mark.asyncio
async def test_api_recommendations_profile_based(client):
    """Test GET /api/recommendations/profile-based."""
    res = await client.get("/api/recommendations/profile-based?top_n=5")
    assert res.status_code == 200
    data = res.json()
    assert "recommendations" in data
    assert "extracted_candidate_skills" in data
