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
