import {
  Internship,
  Application,
  JobAnalysis,
  ResumeMatchResult,
  StudentProfile,
  DashboardMetrics,
  DatasetJob,
  DatasetJobListResponse,
  ResumeMatchApiResponse,
  RecommendationApiResponse,
  ResumeAnalysisResponse,
  SkillGapAnalysisResponse
} from "@/types";
import { INITIAL_PROFILE } from "@/lib/demo-data";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.VERCEL ? "" : "http://localhost:8000");

const DEFAULT_TIMEOUT_MS = 10000;

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  setToken(token: string | null): void {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("internship_tracker_auth_token", token);
      } else {
        localStorage.removeItem("internship_tracker_auth_token");
      }
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== "undefined") {
      return localStorage.getItem("internship_tracker_auth_token") || "demo-token";
    }
    return "demo-token";
  }

  private getHeaders(isJson: boolean = true): HeadersInit {
    const headers: Record<string, string> = {};
    if (isJson) {
      headers["Content-Type"] = "application/json";
    }
    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ): Promise<T> {
    if (!this.baseUrl) {
      throw new Error("Backend API is not configured for this deployment. Local demo data remains available.");
    }

    const url = `${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const isFormData = options.body instanceof FormData;
      const headers = {
        ...this.getHeaders(!isFormData),
        ...(options.headers || {})
      };

      const res = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let errorDetail = `HTTP Error ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson && errJson.detail) {
            errorDetail = typeof errJson.detail === "string" ? errJson.detail : JSON.stringify(errJson.detail);
          }
        } catch {
          errorDetail = res.statusText || errorDetail;
        }
        throw new Error(errorDetail);
      }

      if (res.status === 204) {
        return {} as T;
      }

      return (await res.json()) as T;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          throw new Error(`API request timed out after ${timeoutMs / 1000}s`);
        }
        throw err;
      }
      throw new Error("An unexpected network error occurred.");
    }
  }

  // --- HEALTH & STATUS ---
  async checkHealth(): Promise<{ status: string; service: string } | null> {
    try {
      return await this.request<{ status: string; service: string }>("/health", {
        method: "GET"
      }, 3000);
    } catch {
      return null;
    }
  }

  // --- DASHBOARD TELEMETRY ---
  async getDashboardStats(): Promise<DashboardMetrics> {
    return await this.request<DashboardMetrics>("/api/dashboard/stats", {
      method: "GET"
    });
  }

  // --- INTERNSHIPS ---
  async getInternships(params?: {
    query?: string;
    work_mode?: string;
    is_saved?: boolean;
    sort_by?: string;
    sort_order?: string;
  }): Promise<Internship[]> {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set("query", params.query);
    if (params?.work_mode) searchParams.set("work_mode", params.work_mode);
    if (params?.is_saved !== undefined) searchParams.set("is_saved", String(params.is_saved));
    if (params?.sort_by) searchParams.set("sort_by", params.sort_by);
    if (params?.sort_order) searchParams.set("sort_order", params.sort_order);

    const queryStr = searchParams.toString();
    const endpoint = `/api/internships${queryStr ? `?${queryStr}` : ""}`;
    return await this.request<Internship[]>(endpoint, { method: "GET" });
  }

  async getInternshipById(id: string): Promise<Internship> {
    return await this.request<Internship>(`/api/internships/${encodeURIComponent(id)}`, {
      method: "GET"
    });
  }

  async createInternship(data: Partial<Internship>): Promise<Internship> {
    return await this.request<Internship>("/api/internships", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  async updateInternship(id: string, data: Partial<Internship>): Promise<Internship> {
    return await this.request<Internship>(`/api/internships/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
  }

  async deleteInternship(id: string): Promise<void> {
    await this.request<void>(`/api/internships/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
  }

  async saveInternship(id: string): Promise<{ is_saved: boolean }> {
    return await this.request<{ is_saved: boolean }>(`/api/internships/${encodeURIComponent(id)}/save`, {
      method: "POST"
    });
  }

  async unsaveInternship(id: string): Promise<{ is_saved: boolean }> {
    return await this.request<{ is_saved: boolean }>(`/api/internships/${encodeURIComponent(id)}/save`, {
      method: "DELETE"
    });
  }

  // --- APPLICATIONS ---
  async getApplications(status?: string): Promise<Application[]> {
    const searchParams = new URLSearchParams();
    if (status && status !== "All") searchParams.set("status", status);
    const queryStr = searchParams.toString();
    const endpoint = `/api/applications${queryStr ? `?${queryStr}` : ""}`;
    return await this.request<Application[]>(endpoint, { method: "GET" });
  }

  async getApplicationById(id: string): Promise<Application> {
    return await this.request<Application>(`/api/applications/${encodeURIComponent(id)}`, {
      method: "GET"
    });
  }

  async createApplication(data: Partial<Application>): Promise<Application> {
    return await this.request<Application>("/api/applications", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  async updateApplication(id: string, data: Partial<Application>): Promise<Application> {
    return await this.request<Application>(`/api/applications/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
  }

  async deleteApplication(id: string): Promise<void> {
    await this.request<void>(`/api/applications/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
  }

  // --- USER PROFILE ---
  async getProfile(): Promise<StudentProfile> {
    const raw = await this.request<Record<string, unknown>>("/api/profile", {
      method: "GET"
    });

    const prefWorkModes = Array.isArray(raw.preferred_work_modes)
      ? (raw.preferred_work_modes as string[])
      : typeof raw.preferred_work_mode === "string"
      ? [raw.preferred_work_mode]
      : ["Remote", "Hybrid"];

    const prefRoles = Array.isArray(raw.preferred_roles)
      ? (raw.preferred_roles as string[])
      : typeof raw.career_interests === "string" && raw.career_interests
      ? raw.career_interests.split(",").map((s) => s.trim())
      : ["Software Engineering Intern", "Frontend Engineer", "Full-Stack Developer"];

    const prefLocations = Array.isArray(raw.preferred_locations)
      ? (raw.preferred_locations as string[])
      : typeof raw.preferred_locations === "string" && raw.preferred_locations
      ? raw.preferred_locations.split(",").map((s) => s.trim())
      : ["Seattle, WA", "San Francisco, CA", "Remote"];

    return {
      id: String(raw.id || raw.user_id || "profile-id"),
      email: String(raw.email || INITIAL_PROFILE.email),
      full_name: String(raw.full_name || INITIAL_PROFILE.full_name),
      university: String(raw.university || raw.specialization || INITIAL_PROFILE.university),
      degree: String(raw.degree || INITIAL_PROFILE.degree),
      graduation_year: Number(raw.graduation_year) || INITIAL_PROFILE.graduation_year,
      skills: Array.isArray(raw.skills) ? (raw.skills as string[]) : [],
      preferred_roles: prefRoles,
      preferred_locations: prefLocations,
      preferred_work_modes: prefWorkModes
    };
  }

  async updateProfile(data: Partial<StudentProfile>): Promise<StudentProfile> {
    const payload: Record<string, unknown> = {};
    if (data.full_name !== undefined) payload.full_name = data.full_name;
    if (data.degree !== undefined) payload.degree = data.degree;
    if (data.university !== undefined) payload.specialization = data.university;
    if (data.graduation_year !== undefined) payload.graduation_year = data.graduation_year;
    if (data.skills !== undefined) payload.skills = data.skills;
    if (data.preferred_work_modes !== undefined) {
      payload.preferred_work_mode = data.preferred_work_modes[0] || "any";
    }
    if (data.preferred_locations !== undefined) {
      payload.preferred_locations = data.preferred_locations.join(", ");
    }
    if (data.preferred_roles !== undefined) {
      payload.career_interests = data.preferred_roles.join(", ");
    }

    await this.request<Record<string, unknown>>("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(payload)
    });

    return await this.getProfile();
  }

  // --- RESUME PROCESSING ---
  async uploadResume(file: File): Promise<{
    resume_id: string;
    parse_status: string;
    extracted_profile: {
      skills: string[];
      programming_languages: string[];
      frameworks: string[];
      degree?: string | null;
      graduation_year?: number | null;
    };
    message: string;
  }> {
    const formData = new FormData();
    formData.append("file", file);

    return await this.request<{
      resume_id: string;
      parse_status: string;
      extracted_profile: {
        skills: string[];
        programming_languages: string[];
        frameworks: string[];
        degree?: string | null;
        graduation_year?: number | null;
      };
      message: string;
    }>("/api/resume/upload", {
      method: "POST",
      body: formData
    });
  }

  async parseResume(file: File): Promise<{
    filename: string;
    page_count: number;
    char_count: number;
    word_count: number;
    extracted_text: string;
    detected_skills: string[];
    parsed_data: {
      raw_text: string;
      skills: string[];
    };
    warning?: string;
  }> {
    const formData = new FormData();
    formData.append("file", file);

    const data = await this.request<{
      filename: string;
      page_count: number;
      char_count: number;
      word_count: number;
      extracted_text: string;
      detected_skills: string[];
      warning?: string;
    }>("/api/resume/parse", {
      method: "POST",
      body: formData
    });

    return {
      ...data,
      parsed_data: {
        raw_text: data.extracted_text,
        skills: data.detected_skills || []
      }
    };
  }

  async analyzeResume(payload: { file?: File; resume_text?: string }): Promise<ResumeAnalysisResponse> {
    const formData = new FormData();
    if (payload.file) formData.append("file", payload.file);
    if (payload.resume_text) formData.append("resume_text", payload.resume_text);

    return await this.request<ResumeAnalysisResponse>("/api/resume/analyze", {
      method: "POST",
      body: formData
    });
  }

  async getLatestResume(): Promise<{
    has_resume: boolean;
    resume?: {
      id: string;
      filename: string;
      file_size_bytes: number;
      parse_status: string;
      uploaded_at: string;
    } | null;
    skills: string[];
  }> {
    return await this.request<{
      has_resume: boolean;
      resume?: {
        id: string;
        filename: string;
        file_size_bytes: number;
        parse_status: string;
        uploaded_at: string;
      } | null;
      skills: string[];
    }>("/api/resume/me", { method: "GET" });
  }

  async getResume(id: string): Promise<{
    id: string;
    filename: string;
    file_size_bytes: number;
    parse_status: string;
    uploaded_at: string;
  }> {
    return await this.request<{
      id: string;
      filename: string;
      file_size_bytes: number;
      parse_status: string;
      uploaded_at: string;
    }>(`/api/resume/${encodeURIComponent(id)}`, { method: "GET" });
  }

  async deleteResume(): Promise<{ message: string }> {
    return await this.request<{ message: string }>("/api/resume", {
      method: "DELETE"
    });
  }

  // --- JOB DESCRIPTION ANALYZER ---
  async analyzeJob(description: string, jobUrl?: string): Promise<JobAnalysis> {
    return await this.request<JobAnalysis>("/api/analyze-job", {
      method: "POST",
      body: JSON.stringify({
        description,
        job_url: jobUrl || null
      })
    });
  }

  // --- HUGGING FACE JOBS DATASET ---
  async getDatasetJobs(params?: {
    query?: string;
    job_title?: string;
    company?: string;
    job_type?: string;
    skill?: string;
    is_synthetic?: boolean;
    page?: number;
    limit?: number;
  }): Promise<DatasetJobListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set("query", params.query);
    if (params?.job_title) searchParams.set("job_title", params.job_title);
    if (params?.company) searchParams.set("company", params.company);
    if (params?.job_type) searchParams.set("job_type", params.job_type);
    if (params?.skill) searchParams.set("skill", params.skill);
    if (params?.is_synthetic !== undefined) searchParams.set("is_synthetic", String(params.is_synthetic));
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const queryStr = searchParams.toString();
    const endpoint = `/api/jobs/search${queryStr ? `?${queryStr}` : ""}`;
    return await this.request<DatasetJobListResponse>(endpoint, { method: "GET" });
  }

  async getDatasetJob(id: string): Promise<DatasetJob> {
    return await this.request<DatasetJob>(`/api/jobs/${encodeURIComponent(id)}`, {
      method: "GET"
    });
  }

  async getJobStats(): Promise<{
    total_jobs: number;
    original_real_world_jobs: number;
    augmented_synthetic_jobs: number;
    top_categories: Array<{ job_type: string; count: number }>;
    source: string;
  }> {
    return await this.request<{
      total_jobs: number;
      original_real_world_jobs: number;
      augmented_synthetic_jobs: number;
      top_categories: Array<{ job_type: string; count: number }>;
      source: string;
    }>("/api/jobs/stats", { method: "GET" });
  }

  async saveDatasetJob(id: string): Promise<{ message: string; is_saved: boolean }> {
    return await this.request<{ message: string; is_saved: boolean }>(`/api/jobs/${encodeURIComponent(id)}/save`, {
      method: "POST"
    });
  }

  async unsaveDatasetJob(id: string): Promise<{ message: string; is_saved: boolean }> {
    return await this.request<{ message: string; is_saved: boolean }>(`/api/jobs/save/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
  }

  // --- AI RESUME MATCHING ---
  async matchResume(payload: {
    resume_text: string;
    job_role: string;
    job_company?: string;
    required_skills: string[];
    preferred_skills: string[];
    job_description?: string;
  }): Promise<ResumeMatchResult> {
    return await this.request<ResumeMatchResult>("/api/resume/match", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  async matchResumeWithJob(payload: {
    job_id: string;
    file?: File;
    resume_text?: string;
  }): Promise<ResumeMatchApiResponse> {
    const formData = new FormData();
    formData.append("job_id", payload.job_id);
    if (payload.file) formData.append("file", payload.file);
    if (payload.resume_text) formData.append("resume_text", payload.resume_text);

    return await this.request<ResumeMatchApiResponse>("/api/matching/match-job", {
      method: "POST",
      body: formData
    });
  }

  async analyzeMatching(payload: {
    job_id?: string;
    job_description?: string;
    job_title?: string;
    company?: string;
    required_skills?: string;
    preferred_skills?: string;
    file?: File;
    resume_text?: string;
  }): Promise<ResumeMatchApiResponse> {
    const formData = new FormData();
    if (payload.job_id) formData.append("job_id", payload.job_id);
    if (payload.job_description) formData.append("job_description", payload.job_description);
    if (payload.job_title) formData.append("job_title", payload.job_title);
    if (payload.company) formData.append("company", payload.company);
    if (payload.required_skills) formData.append("required_skills", payload.required_skills);
    if (payload.preferred_skills) formData.append("preferred_skills", payload.preferred_skills);
    if (payload.file) formData.append("file", payload.file);
    if (payload.resume_text) formData.append("resume_text", payload.resume_text);

    return await this.request<ResumeMatchApiResponse>("/api/matching/analyze", {
      method: "POST",
      body: formData
    });
  }

  // --- RECOMMENDATIONS ---
  async getJobRecommendations(params: {
    file?: File;
    resume_text?: string;
    top_n?: number;
    job_type?: string;
    include_synthetic?: boolean;
  }): Promise<RecommendationApiResponse> {
    const formData = new FormData();
    if (params.file) formData.append("file", params.file);
    if (params.resume_text) formData.append("resume_text", params.resume_text);
    if (params.top_n) formData.append("top_n", String(params.top_n));
    if (params.job_type) formData.append("job_type", params.job_type);
    if (params.include_synthetic !== undefined) {
      formData.append("include_synthetic", String(params.include_synthetic));
    }

    return await this.request<RecommendationApiResponse>("/api/recommendations/jobs", {
      method: "POST",
      body: formData
    });
  }

  async getProfileRecommendations(params?: {
    top_n?: number;
    include_synthetic?: boolean;
  }): Promise<RecommendationApiResponse> {
    const searchParams = new URLSearchParams();
    if (params?.top_n) searchParams.set("top_n", String(params.top_n));
    if (params?.include_synthetic !== undefined) {
      searchParams.set("include_synthetic", String(params.include_synthetic));
    }
    const queryStr = searchParams.toString();
    const endpoint = `/api/matching/recommendations${queryStr ? `?${queryStr}` : ""}`;
    return await this.request<RecommendationApiResponse>(endpoint, { method: "GET" });
  }

  // --- SKILL GAP ANALYSIS ---
  async getSkillGapAnalysis(params?: {
    role?: string;
    skills?: string;
    job_id?: string;
  }): Promise<SkillGapAnalysisResponse> {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.set("role", params.role);
    if (params?.skills) searchParams.set("skills", params.skills);
    if (params?.job_id) searchParams.set("job_id", params.job_id);
    const queryStr = searchParams.toString();
    const endpoint = `/api/skills/gap-analysis${queryStr ? `?${queryStr}` : ""}`;
    return await this.request<SkillGapAnalysisResponse>(endpoint, { method: "GET" });
  }
}

export const api = new ApiClient();
