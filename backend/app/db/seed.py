"""
Demo seed data. All entries have is_demo=True and are clearly labeled.
Uses INSERT OR IGNORE for idempotency.
"""
from datetime import date, timedelta
from app.db.models import Internship
from app.db.database import AsyncSessionLocal
import uuid

DEMO_INTERNSHIPS = [
    {
        "company": "[Demo] Google",
        "title": "Software Engineering Intern",
        "description": "Work on large-scale distributed systems and backend services. You will collaborate with engineers to design and implement features impacting millions of users.",
        "required_skills": ["Python", "Go", "Distributed Systems", "SQL"],
        "preferred_skills": ["Kubernetes", "Protobuf", "Machine Learning"],
        "degree_requirement": "B.Tech/B.E. or equivalent",
        "experience_level": "entry",
        "location": "Bangalore, India",
        "work_mode": "hybrid",
        "stipend_min": 80000, "stipend_max": 120000, "currency": "INR",
        "official_url": "https://careers.google.com/",
        "deadline": date.today() + timedelta(days=45),
        "source": "demo", "is_demo": True,
    },
    {
        "company": "[Demo] Microsoft",
        "title": "Data Science Intern",
        "description": "Analyze large datasets to derive insights for Azure cloud products. Build dashboards and ML models to support product decisions.",
        "required_skills": ["Python", "SQL", "Machine Learning", "Pandas", "Numpy"],
        "preferred_skills": ["Azure", "Spark", "Scikit-Learn"],
        "degree_requirement": "B.Tech CS/ECE or M.Tech",
        "experience_level": "entry",
        "location": "Hyderabad, India",
        "work_mode": "hybrid",
        "stipend_min": 70000, "stipend_max": 100000, "currency": "INR",
        "official_url": "https://careers.microsoft.com/",
        "deadline": date.today() + timedelta(days=30),
        "source": "demo", "is_demo": True,
    },
    {
        "company": "[Demo] Flipkart",
        "title": "Frontend Engineering Intern",
        "description": "Build and optimize React-based UI components for Flipkart's e-commerce platform serving 350M+ users.",
        "required_skills": ["React", "Javascript", "Typescript", "CSS", "HTML"],
        "preferred_skills": ["Redux", "GraphQL", "Webpack"],
        "degree_requirement": "B.Tech IT/CS",
        "experience_level": "entry",
        "location": "Bangalore, India",
        "work_mode": "onsite",
        "stipend_min": 40000, "stipend_max": 60000, "currency": "INR",
        "official_url": "https://www.flipkartcareers.com/",
        "deadline": date.today() + timedelta(days=20),
        "source": "demo", "is_demo": True,
    },
    {
        "company": "[Demo] Razorpay",
        "title": "Backend Engineering Intern",
        "description": "Develop microservices for Razorpay's payment gateway. Work with high-throughput systems processing millions of transactions.",
        "required_skills": ["Python", "Go", "SQL", "Docker", "REST API"],
        "preferred_skills": ["Kafka", "Redis", "Kubernetes"],
        "degree_requirement": "B.Tech CS/ECE",
        "experience_level": "entry",
        "location": "Bangalore, India",
        "work_mode": "hybrid",
        "stipend_min": 50000, "stipend_max": 75000, "currency": "INR",
        "official_url": "https://razorpay.com/jobs/",
        "deadline": date.today() + timedelta(days=35),
        "source": "demo", "is_demo": True,
    },
    {
        "company": "[Demo] Zerodha",
        "title": "ML Engineering Intern",
        "description": "Build machine learning models for fraud detection and trading signal generation. Work closely with quant team.",
        "required_skills": ["Python", "Machine Learning", "Scikit-Learn", "SQL", "Pandas"],
        "preferred_skills": ["Deep Learning", "Pytorch", "Airflow"],
        "degree_requirement": "B.Tech CS / M.Sc Statistics",
        "experience_level": "entry",
        "location": "Remote",
        "work_mode": "remote",
        "stipend_min": 35000, "stipend_max": 55000, "currency": "INR",
        "official_url": "https://zerodha.com/careers/",
        "deadline": date.today() + timedelta(days=60),
        "source": "demo", "is_demo": True,
    },
    {
        "company": "[Demo] Swiggy",
        "title": "Product Intern",
        "description": "Define and execute product roadmap features for Swiggy Instamart. Work with design and engineering on rapid 0-to-1 features.",
        "required_skills": ["SQL", "Product Thinking", "Data Analysis"],
        "preferred_skills": ["Python", "Figma", "A/B Testing"],
        "degree_requirement": "Any engineering degree",
        "experience_level": "entry",
        "location": "Bangalore, India",
        "work_mode": "onsite",
        "stipend_min": 30000, "stipend_max": 50000, "currency": "INR",
        "official_url": "https://careers.swiggy.com/",
        "deadline": date.today() + timedelta(days=25),
        "source": "demo", "is_demo": True,
    },
    {
        "company": "[Demo] CRED",
        "title": "iOS Engineering Intern",
        "description": "Develop premium iOS features for CRED app used by 10M+ high-credit-score customers.",
        "required_skills": ["Swift", "iOS", "Xcode", "REST API"],
        "preferred_skills": ["Kotlin", "SwiftUI", "Core Data"],
        "degree_requirement": "B.Tech CS/IT",
        "experience_level": "entry",
        "location": "Bangalore, India",
        "work_mode": "onsite",
        "stipend_min": 50000, "stipend_max": 80000, "currency": "INR",
        "official_url": "https://careers.cred.club/",
        "deadline": date.today() + timedelta(days=15),
        "source": "demo", "is_demo": True,
    },
    {
        "company": "[Demo] Meesho",
        "title": "DevOps Intern",
        "description": "Build and maintain CI/CD pipelines, container orchestration, and cloud infrastructure for Meesho's social commerce platform.",
        "required_skills": ["Docker", "Kubernetes", "Linux", "Bash", "AWS"],
        "preferred_skills": ["Terraform", "Ansible", "Jenkins"],
        "degree_requirement": "B.Tech CS/ECE",
        "experience_level": "entry",
        "location": "Bangalore, India",
        "work_mode": "hybrid",
        "stipend_min": 30000, "stipend_max": 50000, "currency": "INR",
        "official_url": "https://careers.meesho.com/",
        "deadline": date.today() + timedelta(days=50),
        "source": "demo", "is_demo": True,
    },
    {
        "company": "[Demo] Ola",
        "title": "Android Engineering Intern",
        "description": "Build rider and driver-facing Android features for Ola mobility app serving 250 cities.",
        "required_skills": ["Kotlin", "Android", "Java", "REST API"],
        "preferred_skills": ["Jetpack Compose", "Firebase", "MVVM"],
        "degree_requirement": "B.Tech CS/IT",
        "experience_level": "entry",
        "location": "Bangalore, India",
        "work_mode": "hybrid",
        "stipend_min": 35000, "stipend_max": 55000, "currency": "INR",
        "official_url": "https://www.olacabs.com/careers",
        "deadline": date.today() + timedelta(days=40),
        "source": "demo", "is_demo": True,
    },
    {
        "company": "[Demo] Groww",
        "title": "Data Analytics Intern",
        "description": "Analyze user investment patterns, build funnels, and create dashboards to drive product decisions for India's largest investment platform.",
        "required_skills": ["SQL", "Python", "Data Analysis", "Pandas", "Matplotlib"],
        "preferred_skills": ["Tableau", "Power BI", "Spark"],
        "degree_requirement": "B.Tech / B.Sc Statistics / Economics",
        "experience_level": "entry",
        "location": "Bangalore, India",
        "work_mode": "hybrid",
        "stipend_min": 30000, "stipend_max": 45000, "currency": "INR",
        "official_url": "https://groww.in/p/careers",
        "deadline": date.today() + timedelta(days=22),
        "source": "demo", "is_demo": True,
    },
]

async def seed_demo_data():
    async with AsyncSessionLocal() as session:
        for data in DEMO_INTERNSHIPS:
            existing = await session.get(Internship, data.get("id", ""))
            # Check by company+title to avoid duplication
            from sqlalchemy import select
            stmt = select(Internship).where(
                Internship.company == data["company"],
                Internship.title == data["title"],
                Internship.is_demo == True
            )
            result = await session.execute(stmt)
            if result.scalar_one_or_none() is None:
                internship = Internship(id=str(uuid.uuid4()), **data)
                session.add(internship)
        await session.commit()
    print("Demo seed data loaded.")
