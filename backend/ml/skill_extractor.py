"""
NLP & Rule-based Skill Extraction Engine.
Extracts technical skills, frameworks, tools, and platforms using
tokenization, n-gram matching, regex word boundaries, and canonical aliases.
"""
import re
from typing import List, Set, Dict, Tuple

# Comprehensive taxonomy of technical skills categorized and mapped to canonical names
SKILL_TAXONOMY: Dict[str, List[str]] = {
    # Programming Languages
    "Python": ["python", "python3", "py"],
    "JavaScript": ["javascript", "js", "ecmascript"],
    "TypeScript": ["typescript", "ts"],
    "Java": ["java", "jvm"],
    "C++": ["c++", "cpp"],
    "C#": ["c#", "csharp", "c sharp", ".net core"],
    "Go": ["golang", "go language", r"\bgo\b"],
    "Rust": [r"\brust\b"],
    "Swift": [r"\bswift\b"],
    "Kotlin": ["kotlin"],
    "PHP": [r"\bphp\b"],
    "Ruby": [r"\bruby\b"],
    "Scala": ["scala"],
    "R": [r"\br\s+programming\b", r"\br\s+language\b", r"\bprogramming\s+in\s+r\b"],
    "SQL": [r"\bsql\b", "t-sql", "pl/sql", "structured query language"],
    "Bash": ["bash", "shell scripting", "powershell", "zsh"],

    # Web & Frontend
    "React": ["react", "react.js", "reactjs"],
    "Next.js": ["next.js", "nextjs", "next js"],
    "Vue.js": ["vue", "vue.js", "vuejs"],
    "Angular": ["angular", "angularjs"],
    "HTML": [r"\bhtml\b", "html5"],
    "CSS": [r"\bcss\b", "css3"],
    "Tailwind CSS": ["tailwind", "tailwindcss", "tailwind css"],
    "Redux": ["redux", "redux toolkit"],
    "GraphQL": ["graphql", "apollo graphql"],

    # Backend & APIs
    "Node.js": ["node.js", "nodejs", "node js"],
    "Express.js": ["express", "express.js", "expressjs"],
    "FastAPI": ["fastapi", "fast api"],
    "Django": ["django"],
    "Flask": ["flask"],
    "Spring Boot": ["spring boot", "spring framework", "spring"],
    "REST API": ["rest api", "restful api", "restful", "rest apis"],
    "Microservices": ["microservices", "microservice architecture"],
    "gRPC": ["grpc"],

    # Databases & Storage
    "PostgreSQL": ["postgresql", "postgres", "psql"],
    "MySQL": ["mysql"],
    "MongoDB": ["mongodb", "mongo"],
    "SQLite": ["sqlite", "sqlite3"],
    "Redis": ["redis"],
    "Elasticsearch": ["elasticsearch", "elastic search"],
    "Snowflake": ["snowflake"],
    "DynamoDB": ["dynamodb"],

    # Cloud & DevOps
    "Docker": ["docker", "docker containers", "containerization"],
    "Kubernetes": ["kubernetes", "k8s"],
    "AWS": ["aws", "amazon web services", "ec2", "s3", "lambda"],
    "Azure": ["azure", "microsoft azure"],
    "GCP": ["gcp", "google cloud", "google cloud platform"],
    "CI/CD": ["ci/cd", "ci / cd", "continuous integration", "github actions", "gitlab ci", "jenkins"],
    "Terraform": ["terraform"],
    "Git": ["git", "github", "gitlab", "version control"],
    "Linux": ["linux", "unix", "ubuntu"],

    # Machine Learning & Data Science
    "Machine Learning": ["machine learning", "ml algorithms", "statistical modeling"],
    "Deep Learning": ["deep learning", "neural networks", "cnn", "rnn", "lstm"],
    "NLP": ["natural language processing", "nlp", "text mining", "llm", "large language models"],
    "Computer Vision": ["computer vision", "opencv", "object detection", "image processing"],
    "PyTorch": ["pytorch"],
    "TensorFlow": ["tensorflow", "tf", "keras"],
    "Scikit-learn": ["scikit-learn", "sklearn", "scikit learn"],
    "Pandas": ["pandas"],
    "NumPy": ["numpy"],
    "Tableau": ["tableau"],
    "Power BI": ["power bi", "powerbi"],
    "Data Analysis": ["data analysis", "data analytics", "data mining", "eda"],
    "Data Engineering": ["data engineering", "etl", "data pipeline", "apache spark", "airflow"],

    # Engineering & Security
    "Unit Testing": ["unit testing", "pytest", "jest", "junit", "tdd", "test automation"],
    "Cybersecurity": ["cybersecurity", "cyber security", "penetration testing", "infosec", "soc 2"],
    "Agile": ["agile", "scrum", "kanban", "sprint planning"],
    "System Design": ["system design", "distributed systems", "high availability", "scalability"],
}

def extract_skills_from_text(text: str) -> List[str]:
    """
    Extract skills from text (resume or job description) using taxonomy patterns.
    Returns a sorted, unique list of canonical skill names.
    """
    if not text:
        return []

    text_lower = text.lower()
    matched_skills: Set[str] = set()

    for canonical, patterns in SKILL_TAXONOMY.items():
        for pattern in patterns:
            # If pattern has regex boundary syntax
            if pattern.startswith(r"\b") or pattern.endswith(r"\b"):
                if re.search(pattern, text_lower, re.IGNORECASE):
                    matched_skills.add(canonical)
                    break
            else:
                # Use word boundary around exact literal words
                escaped = re.escape(pattern)
                regex = rf"(?<![a-zA-Z0-9_]){escaped}(?![a-zA-Z0-9_])"
                if re.search(regex, text_lower, re.IGNORECASE):
                    matched_skills.add(canonical)
                    break

    return sorted(list(matched_skills))

def extract_skills_from_job(description: str, qualifications: str = "", duties: str = "") -> List[str]:
    """Extract all relevant skills from a job's combined text sections."""
    combined = f"{description}\n{qualifications}\n{duties}"
    return extract_skills_from_text(combined)

def analyze_skill_gap(candidate_skills: List[str], required_skills: List[str]) -> Tuple[List[str], List[str], float]:
    """
    Compare candidate skills against required skills.
    Returns: (matched_skills, missing_skills, overlap_ratio)
    """
    cand_set = {s.lower(): s for s in candidate_skills}
    req_set = {s.lower(): s for s in required_skills}

    matched = []
    missing = []

    for low_req, orig_req in req_set.items():
        if low_req in cand_set:
            matched.append(orig_req)
        else:
            missing.append(orig_req)

    if not req_set:
        ratio = 0.5  # Neutral if no required skills found
    else:
        ratio = len(matched) / len(req_set)

    return sorted(matched), sorted(missing), round(ratio, 4)
