import { Internship, Application, StudentProfile } from "@/types";

export const INITIAL_INTERNSHIPS: Internship[] = [
  {
    id: "seed-msft-swe",
    company: "Microsoft",
    role: "Software Engineering Intern — Cloud & AI Platform",
    description:
      "Join Microsoft's Core Services Engineering and Azure platform team. You will build high-throughput microservices, design scalable APIs, and implement machine-learning deployment pipelines.",
    location: "Redmond, WA / Remote Option",
    work_mode: "Hybrid",
    stipend: "$52/hr (~$8,300/mo) + Relocation Housing",
    deadline: "2026-11-15",
    job_url: "https://careers.microsoft.com/students",
    required_skills: ["Python", "C++", "Distributed Systems", "Azure", "Docker"],
    preferred_skills: ["Kubernetes", "Linux", "System Design"],
    eligibility: "Pursuing Bachelor's or Master's in Computer Science or related STEM field graduating in 2026 or 2027.",
    notes: "Requires 1 online coding assessment followed by 3 technical video rounds.",
    is_saved: true,
    is_demo: true,
    created_at: "2026-10-01T10:00:00Z"
  },
  {
    id: "seed-nvda-dl",
    company: "NVIDIA",
    role: "Deep Learning Research Intern",
    description:
      "Collaborate with world-class AI researchers to accelerate deep learning training and inference on GPU architectures. Work on state-of-the-art transformer optimization and model distillation.",
    location: "Santa Clara, CA",
    work_mode: "On-site",
    stipend: "$58/hr (~$9,280/mo) + Housing Subsidy",
    deadline: "2026-10-30",
    job_url: "https://nvidia.com/careers/university",
    required_skills: ["Python", "PyTorch", "C++", "Deep Learning", "CUDA"],
    preferred_skills: ["TensorFlow", "Algorithms", "Computer Vision"],
    eligibility: "Enrolled in MS or PhD program in Computer Science, AI, or Computer Engineering.",
    notes: "Emphasis on PyTorch internals and high-performance computing.",
    is_saved: true,
    is_demo: true,
    created_at: "2026-10-02T11:00:00Z"
  },
  {
    id: "seed-stripe-fe",
    company: "Stripe",
    role: "Frontend Engineering Intern — Developer Experience",
    description:
      "Help build the financial infrastructure of the internet. Create intuitive, responsive, and resilient user interfaces for developers and businesses around the globe using React, TypeScript, and modern design systems.",
    location: "San Francisco, CA / Distributed",
    work_mode: "Remote",
    stipend: "$55/hr (~$8,800/mo) + Equipment Stipend",
    deadline: "2026-11-20",
    job_url: "https://stripe.com/jobs/university",
    required_skills: ["TypeScript", "React", "Next.js", "CSS3", "REST APIs"],
    preferred_skills: ["GraphQL", "Tailwind CSS", "Testing Library"],
    eligibility: "Undergraduate or graduate student graduating within 18 months.",
    notes: "Strong focus on web accessibility, typography, and frontend performance.",
    is_saved: false,
    is_demo: true,
    created_at: "2026-10-03T12:00:00Z"
  },
  {
    id: "seed-atlassian-fs",
    company: "Atlassian",
    role: "Full Stack Engineer Intern — Jira & Confluence",
    description:
      "Build cloud collaboration tools used by millions of teams worldwide. Work across the frontend and backend stack delivering secure, scalable cloud microservices.",
    location: "Austin, TX",
    work_mode: "Remote",
    stipend: "$48/hr (~$7,680/mo)",
    deadline: "2026-12-01",
    job_url: "https://atlassian.com/company/careers/graduates",
    required_skills: ["Java", "TypeScript", "React", "AWS", "SQL"],
    preferred_skills: ["Docker", "Node.js", "Agile"],
    eligibility: "Current undergraduate or graduate student in Computer Science or related degree.",
    notes: "Company operates on Team Anywhere policy.",
    is_saved: false,
    is_demo: true,
    created_at: "2026-10-04T09:30:00Z"
  },
  {
    id: "seed-figma-ds",
    company: "Figma",
    role: "Design Systems & Core UI Intern",
    description:
      "Bridge the boundary between design and code. Develop cutting-edge interactive canvas tools and design token infrastructure powering Figma's flagship browser-based design software.",
    location: "New York, NY",
    work_mode: "Hybrid",
    stipend: "$50/hr (~$8,000/mo)",
    deadline: "2026-11-10",
    job_url: "https://figma.com/careers",
    required_skills: ["TypeScript", "React", "Figma", "HTML5", "CSS3"],
    preferred_skills: ["WebAssembly", "C++", "WebGL"],
    eligibility: "Enrolled in an accredited college degree program graduating in 2026 or 2027.",
    notes: "Portfolio or live web project links are highly encouraged.",
    is_saved: true,
    is_demo: true,
    created_at: "2026-10-05T14:15:00Z"
  },
  {
    id: "seed-deepmind-ai",
    company: "Google DeepMind",
    role: "AI Research Engineering Intern",
    description:
      "Work on frontier foundation models and reinforcement learning algorithms alongside research scientists. Design distributed experiment benchmarks and analyze model capabilities.",
    location: "London, UK / Remote Option",
    work_mode: "Hybrid",
    stipend: "£38/hr (~£6,000/mo) + Relocation Allowance",
    deadline: "2026-11-25",
    job_url: "https://deepmind.google/careers",
    required_skills: ["Python", "PyTorch", "Machine Learning", "Algorithms", "NLP"],
    preferred_skills: ["JAX", "Distributed Systems", "Data Structures"],
    eligibility: "Master's or PhD candidates specializing in machine learning, mathematics, or statistics.",
    notes: "Review published papers on arXiv as preparation.",
    is_saved: false,
    is_demo: true,
    created_at: "2026-10-06T16:00:00Z"
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: "app-1",
    internship_id: "seed-msft-swe",
    company: "Microsoft",
    role: "Software Engineering Intern — Cloud & AI Platform",
    status: "Interview",
    applied_date: "2026-10-01",
    interview_date: "2026-10-28",
    deadline: "2026-11-15",
    match_score: 92,
    next_action: "Prepare System Design & Azure architectural round",
    notes: "Completed online assessment with 100% test cases passed. 2 technical rounds scheduled on Teams.",
    job_url: "https://careers.microsoft.com/students",
    created_at: "2026-10-01T10:00:00Z"
  },
  {
    id: "app-2",
    internship_id: "seed-nvda-dl",
    company: "NVIDIA",
    role: "Deep Learning Research Intern",
    status: "Assessment",
    applied_date: "2026-10-08",
    deadline: "2026-10-30",
    match_score: 86,
    next_action: "Complete HackerRank coding test before Oct 25",
    notes: "Assessment link received. Requires deep C++ memory management and PyTorch implementations.",
    job_url: "https://nvidia.com/careers/university",
    created_at: "2026-10-08T11:00:00Z"
  },
  {
    id: "app-3",
    internship_id: "seed-stripe-fe",
    company: "Stripe",
    role: "Frontend Engineering Intern — Developer Experience",
    status: "Applied",
    applied_date: "2026-10-12",
    deadline: "2026-11-20",
    match_score: 88,
    next_action: "Awaiting recruiter application review",
    notes: "Submitted with tailored resume emphasizing React performance optimizations.",
    job_url: "https://stripe.com/jobs/university",
    created_at: "2026-10-12T12:00:00Z"
  },
  {
    id: "app-4",
    internship_id: "seed-figma-ds",
    company: "Figma",
    role: "Design Systems & Core UI Intern",
    status: "Saved",
    deadline: "2026-11-10",
    match_score: 78,
    next_action: "Tailor resume and attach portfolio link before applying",
    notes: "Job posting closes soon. Need to finalize design token project demo.",
    job_url: "https://figma.com/careers",
    created_at: "2026-10-13T14:15:00Z"
  },
  {
    id: "app-5",
    internship_id: null,
    company: "Datadog",
    role: "Software Engineering Intern — Observability",
    status: "Selected",
    applied_date: "2026-09-15",
    deadline: "2026-10-25",
    match_score: 95,
    next_action: "Review formal offer letter and sign paperwork",
    notes: "Offer received: $54/hr + housing stipend. Deadline to accept is next Friday.",
    job_url: "https://datadoghq.com/careers",
    created_at: "2026-09-15T09:00:00Z"
  },
  {
    id: "app-6",
    internship_id: null,
    company: "Meta",
    role: "Software Engineer Intern — Core Systems",
    status: "Rejected",
    applied_date: "2026-09-01",
    deadline: "2026-09-20",
    match_score: 71,
    next_action: "Reapply in autumn for next cycle",
    notes: "Position filled for current term. Reached technical screen round.",
    job_url: "https://metacareers.com",
    created_at: "2026-09-01T08:00:00Z"
  }
];

export const INITIAL_PROFILE: StudentProfile = {
  id: "student-1",
  email: "student@university.edu",
  full_name: "Student User",
  university: "Your University",
  degree: "B.S. in Computer Science",
  graduation_year: new Date().getFullYear() + 2,
  skills: [
    "Python",
    "TypeScript",
    "React",
    "Next.js",
    "PyTorch",
    "SQL",
    "Docker",
    "Git",
    "Tailwind CSS"
  ],
  preferred_roles: [
    "Software Engineering Intern",
    "Frontend Engineering Intern",
    "AI/ML Research Intern"
  ],
  preferred_locations: ["Seattle, WA", "San Francisco, CA", "Remote"],
  preferred_work_modes: ["Remote", "Hybrid"]
};

export const SAMPLE_RESUME_TEXT = `Student User
student@university.edu | (555) 234-5678 | Seattle, WA | github.com/student-user | linkedin.com/in/student-user

EDUCATION
University of Washington, Seattle, WA
Bachelor of Science in Computer Science, Minor in Mathematics
Expected Graduation: June 2027 | Cumulative GPA: 3.88 / 4.00
Relevant Coursework: Data Structures & Algorithms, Distributed Systems, Database Systems, Artificial Intelligence, Computer Vision.

TECHNICAL SKILLS
Languages: Python, TypeScript, JavaScript, C++, SQL, HTML5, CSS3
Frameworks & Libraries: React, Next.js, FastAPI, Node.js, PyTorch, Scikit-Learn, Tailwind CSS
Developer Tools: Docker, Git, GitHub Actions, AWS (S3, EC2), PostgreSQL, Redis, Linux, Vercel

PROJECTS
AI Multi-Agent Task Assistant | Next.js, TypeScript, FastAPI, Docker, PostgreSQL
- Built an autonomous workflow management web application serving 1,200+ active university student users.
- Designed REST APIs with FastAPI handling 400+ requests/minute with sub-100ms response times.
- Containerized microservices using Docker and automated CI/CD deployment pipelines on Vercel and Railway.

Distributed Key-Value Store | C++, Raft Consensus Algorithm, Linux
- Implemented a fault-tolerant distributed key-value store using the Raft consensus protocol in C++.
- Ensured strong consistency and linearizable reads/writes across 5 distributed server nodes during network partitions.
- Benchmarked throughput achieving 12,000 transactions per second under simulated concurrent workloads.

EXPERIENCE
Undergraduate Research Assistant | UW Distributed Systems & AI Lab | Sept 2025 – Present
- Collaborated with PhD researchers on optimizing distributed model training pipelines using PyTorch and CUDA.
- Reduced memory overhead by 22% through dynamic gradient checkpointing and mixed-precision evaluation.

Computer Science Teaching Assistant | UW Paul G. Allen School | Jan 2025 – June 2025
- Mentored 85+ students in introductory data structures (CSE 373); conducted weekly lab sections and code reviews.
`;

export const SAMPLE_JOB_TEMPLATES = [
  {
    label: "Anthropic — Prompt & Safety Engineering Intern",
    company: "Anthropic",
    role: "Prompt & Safety Engineering Intern",
    text: `About Anthropic:
Anthropic is an AI safety and research company that builds reliable, interpretable, and steerable AI systems.

Role: Prompt & Safety Engineering Intern
Location: San Francisco, CA (Hybrid)
Compensation: $60/hour (~$9,600/month) + Relocation Assistance
Application Deadline: November 30, 2026

About the Role:
We are looking for passionate students to help evaluate frontier model alignment and develop systematic red-teaming benchmarks.

Eligibility:
Currently enrolled in a Bachelor's, Master's, or PhD program in Computer Science, Linguistics, or related STEM disciplines graduating in 2026 or 2027.

Key Responsibilities:
- Design prompt-evaluation datasets and safety benchmarks for large language models.
- Implement automated testing harnesses using Python and REST APIs.
- Collaborate with research teams on RLHF evaluation and bias mitigation.
- Document research findings and present findings to core safety teams.

Required Skills:
- Python
- NLP
- Machine Learning
- Git
- REST APIs

Preferred Skills:
- PyTorch
- Docker
- Data Structures
- TypeScript`
  },
  {
    label: "Microsoft — Software Engineering Intern (Azure Cloud)",
    company: "Microsoft",
    role: "Software Engineering Intern — Cloud & AI Platform",
    text: `Join Microsoft as a Software Engineering Intern on the Azure Platform team.
Location: Redmond, WA (Hybrid)
Stipend: $52/hour + Housing Allowance
Deadline: November 15, 2026

Qualifications:
- Enrolled in BS or MS in Computer Science, graduating between Dec 2026 and June 2027.
- Strong knowledge of data structures, algorithms, and system design fundamentals.

Responsibilities:
- Build high-scale microservices powering Azure cloud storage.
- Write robust unit tests, automated integration pipelines, and production-grade code.
- Collaborate across cross-functional engineering teams in an Agile environment.

Requirements:
- C++
- Python
- Azure
- Distributed Systems
- Docker`
  },
  {
    label: "Stripe — Frontend Engineering Intern",
    company: "Stripe",
    role: "Frontend Engineering Intern — Developer Experience",
    text: `Stripe is hiring a Frontend Engineering Intern for our developer infrastructure teams.
Location: Remote (US & Canada)
Stipend: $55/hour + $1,000 Home Office Stipend
Deadline: November 20, 2026

We are looking for students who love building clean, responsive, and accessible web experiences.

What you will do:
- Design and implement developer dashboards and API documentation tools.
- Optimize frontend web performance, accessibility, and typography.
- Partner with product designers and engineers to create reusable React components.

Requirements:
- TypeScript
- React
- Next.js
- CSS3
- REST APIs

Preferred:
- Tailwind CSS
- GraphQL
- Figma`
  }
];
