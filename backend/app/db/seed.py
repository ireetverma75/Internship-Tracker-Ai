"""Database seeding for realistic demo opportunities and applications."""
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from app.db.models import InternshipModel, ApplicationModel


def seed_demo_data(db: Session):
    """Seed initial fictional opportunities if database table is empty."""
    count = db.query(InternshipModel).count()
    if count > 0:
        return

    today = date.today()

    internships = [
        InternshipModel(
            id="seed-msft-swe",
            company="Microsoft",
            role="Software Engineering Intern — Cloud & AI Platform",
            description=(
                "Join Microsoft's Core Services Engineering and Azure platform team. "
                "You will build high-throughput microservices, design scalable APIs, and implement machine-learning deployment pipelines."
            ),
            location="Redmond, WA / Remote Option",
            work_mode="Hybrid",
            stipend="$52/hr (~$8,300/mo) + Relocation Housing",
            deadline=today + timedelta(days=24),
            job_url="https://careers.microsoft.com/students",
            required_skills=["Python", "C++", "Distributed Systems", "Azure", "Docker"],
            preferred_skills=["Kubernetes", "Linux", "System Design"],
            eligibility="Pursuing Bachelor's or Master's in Computer Science or related STEM field graduating in 2026 or 2027.",
            notes="Requires 1 online coding assessment followed by 3 technical video rounds.",
            is_demo=True,
            is_saved=True
        ),
        InternshipModel(
            id="seed-nvda-dl",
            company="NVIDIA",
            role="Deep Learning Research Intern",
            description=(
                "Collaborate with world-class AI researchers to accelerate deep learning training and inference on GPU architectures. "
                "Work on state-of-the-art transformer optimization and model distillation."
            ),
            location="Santa Clara, CA",
            work_mode="On-site",
            stipend="$58/hr (~$9,280/mo) + Housing Subsidy",
            deadline=today + timedelta(days=12),
            job_url="https://nvidia.com/careers/university",
            required_skills=["Python", "PyTorch", "C++", "Deep Learning", "CUDA"],
            preferred_skills=["TensorFlow", "Algorithms", "Computer Vision"],
            eligibility="Enrolled in MS or PhD program in Computer Science, AI, or Computer Engineering.",
            notes="Emphasis on PyTorch internals and high-performance computing.",
            is_demo=True,
            is_saved=True
        ),
        InternshipModel(
            id="seed-stripe-fe",
            company="Stripe",
            role="Frontend Engineering Intern — Developer Experience",
            description=(
                "Help build the financial infrastructure of the internet. Create intuitive, responsive, and resilient user interfaces "
                "for developers and businesses around the globe using React, TypeScript, and modern design systems."
            ),
            location="San Francisco, CA / Distributed",
            work_mode="Remote",
            stipend="$55/hr (~$8,800/mo) + Equipment Stipend",
            deadline=today + timedelta(days=32),
            job_url="https://stripe.com/jobs/university",
            required_skills=["TypeScript", "React", "Next.js", "CSS3", "REST APIs"],
            preferred_skills=["GraphQL", "Tailwind CSS", "Testing Library"],
            eligibility="Undergraduate or graduate student graduating within 18 months.",
            notes="Strong focus on web accessibility, typography, and frontend performance.",
            is_demo=True,
            is_saved=False
        ),
        InternshipModel(
            id="seed-atlassian-fs",
            company="Atlassian",
            role="Full Stack Engineer Intern — Jira & Confluence",
            description=(
                "Build cloud collaboration tools used by millions of teams worldwide. Work across the frontend and backend stack "
                "delivering secure, scalable cloud microservices."
            ),
            location="Austin, TX",
            work_mode="Remote",
            stipend="$48/hr (~$7,680/mo)",
            deadline=today + timedelta(days=45),
            job_url="https://atlassian.com/company/careers/graduates",
            required_skills=["Java", "TypeScript", "React", "AWS", "SQL"],
            preferred_skills=["Docker", "Node.js", "Agile"],
            eligibility="Current undergraduate or graduate student in Computer Science or related degree.",
            notes="Company operates on Team Anywhere policy.",
            is_demo=True,
            is_saved=False
        ),
        InternshipModel(
            id="seed-figma-ds",
            company="Figma",
            role="Design Systems & Core UI Intern",
            description=(
                "Bridge the boundary between design and code. Develop cutting-edge interactive canvas tools and design token infrastructure "
                "powering Figma's flagship browser-based design software."
            ),
            location="New York, NY",
            work_mode="Hybrid",
            stipend="$50/hr (~$8,000/mo)",
            deadline=today + timedelta(days=18),
            job_url="https://figma.com/careers",
            required_skills=["TypeScript", "React", "Figma", "HTML5", "CSS3"],
            preferred_skills=["WebAssembly", "C++", "WebGL"],
            eligibility="Enrolled in an accredited college degree program graduating in 2026 or 2027.",
            notes="Portfolio or live web project links are highly encouraged.",
            is_demo=True,
            is_saved=True
        ),
        InternshipModel(
            id="seed-deepmind-ai",
            company="Google DeepMind",
            role="AI Research Engineering Intern",
            description=(
                "Work on frontier foundation models and reinforcement learning algorithms alongside research scientists. "
                "Design distributed experiment benchmarks and analyze model capabilities."
            ),
            location="London, UK / Remote Option",
            work_mode="Hybrid",
            stipend="£38/hr (~£6,000/mo) + Relocation Allowance",
            deadline=today + timedelta(days=38),
            job_url="https://deepmind.google/careers",
            required_skills=["Python", "PyTorch", "Machine Learning", "Algorithms", "NLP"],
            preferred_skills=["JAX", "Distributed Systems", "Data Structures"],
            eligibility="Master's or PhD candidates specializing in machine learning, mathematics, or statistics.",
            notes="Review published papers on arXiv as preparation.",
            is_demo=True,
            is_saved=False
        ),
    ]

    for item in internships:
        db.add(item)
    db.flush()

    # Seed Applications corresponding to internships
    applications = [
        ApplicationModel(
            id="seed-app-msft",
            internship_id="seed-msft-swe",
            company="Microsoft",
            role="Software Engineering Intern — Cloud & AI Platform",
            status="Interview",
            applied_date=today - timedelta(days=14),
            interview_date=today + timedelta(days=4),
            deadline=today + timedelta(days=24),
            match_score=92,
            next_action="Prepare System Design & Azure architectural round",
            notes="Completed OA with 100% test cases passed. 2 technical rounds scheduled on Teams.",
            job_url="https://careers.microsoft.com/students"
        ),
        ApplicationModel(
            id="seed-app-nvda",
            internship_id="seed-nvda-dl",
            company="NVIDIA",
            role="Deep Learning Research Intern",
            status="Assessment",
            applied_date=today - timedelta(days=7),
            deadline=today + timedelta(days=12),
            match_score=86,
            next_action="Complete HackerRank coding test before Oct 25",
            notes="Assessment link received. Requires deep C++ memory management and PyTorch implementations.",
            job_url="https://nvidia.com/careers/university"
        ),
        ApplicationModel(
            id="seed-app-stripe",
            internship_id="seed-stripe-fe",
            company="Stripe",
            role="Frontend Engineering Intern — Developer Experience",
            status="Applied",
            applied_date=today - timedelta(days=3),
            deadline=today + timedelta(days=32),
            match_score=88,
            next_action="Awaiting recruiter application review",
            notes="Submitted with tailored resume emphasizing React performance optimizations.",
            job_url="https://stripe.com/jobs/university"
        ),
        ApplicationModel(
            id="seed-app-figma",
            internship_id="seed-figma-ds",
            company="Figma",
            role="Design Systems & Core UI Intern",
            status="Saved",
            deadline=today + timedelta(days=18),
            match_score=78,
            next_action="Tailor resume and attach portfolio link before applying",
            notes="Job posting closes soon. Need to finalize design token project demo.",
            job_url="https://figma.com/careers"
        ),
        ApplicationModel(
            id="seed-app-datadog",
            internship_id=None,
            company="Datadog",
            role="Software Engineering Intern — Observability",
            status="Selected",
            applied_date=today - timedelta(days=35),
            match_score=94,
            next_action="Review formal offer letter and sign paperwork",
            notes="Offer received: $54/hr + housing stipend. Deadline to accept is next Friday.",
            job_url="https://datadoghq.com/careers"
        ),
        ApplicationModel(
            id="seed-app-meta",
            internship_id=None,
            company="Meta",
            role="Software Engineer Intern — Core Systems",
            status="Rejected",
            applied_date=today - timedelta(days=40),
            match_score=71,
            next_action="Reapply in autumn for next cycle",
            notes="Position filled for current term. Reached technical screen round.",
            job_url="https://metacareers.com"
        )
    ]

    for app in applications:
        db.add(app)

    db.commit()
