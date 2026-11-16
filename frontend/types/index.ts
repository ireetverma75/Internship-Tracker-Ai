export type ApplicationStatus =
  | "Saved"
  | "Applied"
  | "Assessment"
  | "Interview"
  | "Selected"
  | "Rejected";

export type WorkMode = "Remote" | "Hybrid" | "On-site";

export interface Internship {
  id: string;
  company: string;
  role: string;
  description?: string;
  location?: string;
  work_mode?: string;
  stipend?: string;
  deadline?: string;
  job_url?: string;
  required_skills: string[];
  preferred_skills: string[];
  eligibility?: string;
  notes?: string;
  is_saved?: boolean;
  is_demo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Application {
  id: string;
  internship_id?: string | null;
  company: string;
  role: string;
  status: ApplicationStatus;
  applied_date?: string | null;
  interview_date?: string | null;
  deadline?: string | null;
  match_score?: number | null;
  next_action?: string | null;
  notes?: string | null;
  job_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface JobAnalysis {
  role: string;
  company?: string | null;
  experience_requirement?: string;
  eligibility_criteria?: string;
  required_skills: string[];
  preferred_skills: string[];
  responsibilities: string[];
  location?: string;
  work_mode?: string;
  stipend_or_salary?: string;
  application_deadline?: string;
  important_qualifications: string[];
  summary: string;
  is_demo?: boolean;
  model_used?: string;
}

export interface ResumeMatchResult {
  match_score: number;
  matched_required_skills: string[];
  missing_required_skills: string[];
  preferred_skills_found: string[];
  relevant_experience_evidence: string[];
  education_observations: string[];
  resume_improvement_suggestions: string[];
  recommended_skills_to_learn: string[];
  scoring_explanation: string;
  is_demo?: boolean;
  model_used?: string;
}

export interface StudentProfile {
  id: string;
  email: string;
  full_name: string;
  university: string;
  degree: string;
  graduation_year: number;
  skills: string[];
  preferred_roles: string[];
  preferred_locations: string[];
  preferred_work_modes: string[];
}

export interface DashboardMetrics {
  savedInternshipsCount: number;
  applicationsSubmittedCount: number;
  interviewsScheduledCount: number;
  upcomingDeadlinesCount: number;
  statusCounts: Record<ApplicationStatus, number>;
  averageMatchScore: number;
}

export interface DatasetJob {
  id: string;
  job_title: string;
  company: string;
  job_type?: string | null;
  description?: string | null;
  qualifications?: string | null;
  duties?: string | null;
  pay?: string | null;
  source?: string;
  is_synthetic?: boolean;
  created_at?: string;
  skills: string[];
}

export interface DatasetJobListResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  jobs: DatasetJob[];
  job_types: string[];
  companies: string[];
}

export interface JobMatchResultDetail {
  job_id: string;
  job_title: string;
  company: string;
  job_type?: string | null;
  pay?: string | null;
  is_synthetic: boolean;
  match_score: number;
  tfidf_similarity: number;
  skill_overlap_ratio: number;
  matched_skills: string[];
  missing_skills: string[];
  recommendation: string;
  qualification_match?: string | null;
}

export interface ResumeMatchApiResponse {
  extracted_candidate_skills: string[];
  total_skills_detected: number;
  match_result: JobMatchResultDetail;
}

export interface RecommendationApiResponse {
  total_recommendations: number;
  extracted_candidate_skills: string[];
  recommendations: JobMatchResultDetail[];
}

export interface ResumeAnalysisResponse {
  filename: string;
  page_count: number;
  char_count: number;
  word_count: number;
  extracted_text: string;
  detected_skills: string[];
  quality_score: number;
  quality_breakdown: {
    impact: number;
    skills_density: number;
    structure: number;
    conciseness: number;
  };
  suggestions: string[];
  extracted_profile?: {
    skills: string[];
    programming_languages: string[];
    frameworks: string[];
    certifications: string[];
    project_titles: string[];
    career_interests: string;
    degree?: string | null;
    specialization?: string | null;
    graduation_year?: number | null;
  };
}

export interface SkillGapCategory {
  name: string;
  skills: {
    name: string;
    status: "acquired" | "missing" | "in_progress";
    importance: string;
    resource?: string;
  }[];
}

export interface SkillGapAnalysisResponse {
  role: string;
  description: string;
  candidate_skills: string[];
  target_skills: string[];
  matched_skills: string[];
  missing_skills: string[];
  match_percentage: number;
  categories: SkillGapCategory[];
  recommendations: string[];
}
