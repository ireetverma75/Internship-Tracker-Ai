import {
  Internship,
  Application,
  JobAnalysis,
  ResumeMatchResult
} from "@/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async checkHealth(): Promise<{ status: string; service: string } | null> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  }

  async getInternships(params?: {
    query?: string;
    work_mode?: string;
    is_saved?: boolean;
    sort_by?: string;
    sort_order?: string;
  }): Promise<Internship[]> {
    const url = new URL(`${this.baseUrl}/api/internships`);
    if (params?.query) url.searchParams.set("query", params.query);
    if (params?.work_mode) url.searchParams.set("work_mode", params.work_mode);
    if (params?.is_saved !== undefined)
      url.searchParams.set("is_saved", String(params.is_saved));
    if (params?.sort_by) url.searchParams.set("sort_by", params.sort_by);
    if (params?.sort_order) url.searchParams.set("sort_order", params.sort_order);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return await res.json();
  }

  async createInternship(data: Partial<Internship>): Promise<Internship> {
    const res = await fetch(`${this.baseUrl}/api/internships`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Failed to create internship: ${res.statusText}`);
    return await res.json();
  }

  async updateInternship(id: string, data: Partial<Internship>): Promise<Internship> {
    const res = await fetch(`${this.baseUrl}/api/internships/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Failed to update internship: ${res.statusText}`);
    return await res.json();
  }

  async deleteInternship(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/internships/${id}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error(`Failed to delete internship: ${res.statusText}`);
  }

  async getApplications(status?: string): Promise<Application[]> {
    const url = new URL(`${this.baseUrl}/api/applications`);
    if (status && status !== "All") url.searchParams.set("status", status);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return await res.json();
  }

  async createApplication(data: Partial<Application>): Promise<Application> {
    const res = await fetch(`${this.baseUrl}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Failed to create application: ${res.statusText}`);
    return await res.json();
  }

  async updateApplication(id: string, data: Partial<Application>): Promise<Application> {
    const res = await fetch(`${this.baseUrl}/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Failed to update application: ${res.statusText}`);
    return await res.json();
  }

  async deleteApplication(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/applications/${id}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error(`Failed to delete application: ${res.statusText}`);
  }

  async analyzeJob(description: string, jobUrl?: string): Promise<JobAnalysis> {
    const res = await fetch(`${this.baseUrl}/api/analyze-job`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        job_url: jobUrl || null
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Analysis request failed.");
    }
    return await res.json();
  }

  async parseResumePdf(file: File): Promise<{
    filename: string;
    page_count: number;
    char_count: number;
    word_count: number;
    extracted_text: string;
    detected_skills: string[];
    warning?: string;
  }> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${this.baseUrl}/api/resume/parse`, {
      method: "POST",
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "PDF parse failed.");
    }
    return await res.json();
  }

  async matchResume(payload: {
    resume_text: string;
    job_role: string;
    job_company?: string;
    required_skills: string[];
    preferred_skills: string[];
    job_description?: string;
  }): Promise<ResumeMatchResult> {
    const res = await fetch(`${this.baseUrl}/api/resume/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Match analysis failed.");
    }
    return await res.json();
  }
}

export const api = new ApiClient();
