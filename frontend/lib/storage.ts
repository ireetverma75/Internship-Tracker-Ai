import {
  Internship,
  Application,
  JobAnalysis,
  ResumeMatchResult,
  StudentProfile,
  DashboardMetrics,
  ApplicationStatus
} from "@/types";
import {
  INITIAL_INTERNSHIPS,
  INITIAL_APPLICATIONS,
  INITIAL_PROFILE
} from "./demo-data";
import { api } from "./api";

const STORAGE_KEY_INTERNSHIPS = "internship_tracker_items_v1";
const STORAGE_KEY_APPLICATIONS = "internship_tracker_apps_v1";
const STORAGE_KEY_PROFILE = "internship_tracker_profile_v1";
const STORAGE_KEY_DEMO_MODE = "internship_tracker_demo_mode_v1";

export const NOTIFY_CHANGE_EVENT = "internship-tracker-sync-event";

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NOTIFY_CHANGE_EVENT));
  }
}

export class DataStore {
  private isBackendOnline: boolean | null = null;

  async checkBackendStatus(): Promise<boolean> {
    const health = await api.checkHealth();
    this.isBackendOnline = health !== null;
    return this.isBackendOnline;
  }

  getIsBackendOnline(): boolean {
    return this.isBackendOnline ?? false;
  }

  // INTERNSHIPS
  async getInternships(): Promise<Internship[]> {
    // Proactively try backend first
    try {
      const remote = await api.getInternships();
      if (remote && Array.isArray(remote)) {
        this.isBackendOnline = true;
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY_INTERNSHIPS, JSON.stringify(remote));
        }
        return remote;
      }
    } catch {
      this.isBackendOnline = false;
    }

    // Local Storage fallback
    if (typeof window === "undefined") return INITIAL_INTERNSHIPS;
    const stored = localStorage.getItem(STORAGE_KEY_INTERNSHIPS);
    if (!stored) {
      localStorage.setItem(
        STORAGE_KEY_INTERNSHIPS,
        JSON.stringify(INITIAL_INTERNSHIPS)
      );
      return INITIAL_INTERNSHIPS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_INTERNSHIPS;
    }
  }

  async getInternshipById(id: string): Promise<Internship | null> {
    const list = await this.getInternships();
    return list.find((i) => i.id === id) || null;
  }

  async saveInternship(item: Partial<Internship>): Promise<Internship> {
    let created: Internship;

    // Try backend
    try {
      created = await api.createInternship(item);
      this.isBackendOnline = true;
      const list = await this.getInternships();
      const updated = [created, ...list.filter((i) => i.id !== created.id)];
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_INTERNSHIPS, JSON.stringify(updated));
      }
      notifyChange();
      return created;
    } catch {
      this.isBackendOnline = false;
    }

    // Local storage
    const list = await this.getInternships();
    created = {
      id: item.id || `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      company: item.company || "Company",
      role: item.role || "Internship Role",
      description: item.description || "",
      location: item.location || "Remote",
      work_mode: item.work_mode || "Remote",
      stipend: item.stipend || "",
      deadline: item.deadline || "",
      job_url: item.job_url || "",
      required_skills: item.required_skills || [],
      preferred_skills: item.preferred_skills || [],
      eligibility: item.eligibility || "",
      notes: item.notes || "",
      is_saved: item.is_saved ?? true,
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updated = [created, ...list];
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_INTERNSHIPS, JSON.stringify(updated));
    }
    notifyChange();
    return created;
  }

  async updateInternship(
    id: string,
    updates: Partial<Internship>
  ): Promise<Internship | null> {
    try {
      const res = await api.updateInternship(id, updates);
      this.isBackendOnline = true;
      const list = await this.getInternships();
      const idx = list.findIndex((i) => i.id === id);
      if (idx !== -1) list[idx] = res;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_INTERNSHIPS, JSON.stringify(list));
      }
      notifyChange();
      return res;
    } catch {
      this.isBackendOnline = false;
    }

    const list = await this.getInternships();
    const idx = list.findIndex((i) => i.id === id);
    if (idx === -1) return null;

    const modified = {
      ...list[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    list[idx] = modified;

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_INTERNSHIPS, JSON.stringify(list));
    }
    notifyChange();
    return modified;
  }

  async deleteInternship(id: string): Promise<boolean> {
    try {
      await api.deleteInternship(id);
      this.isBackendOnline = true;
    } catch {
      this.isBackendOnline = false;
    }

    const list = await this.getInternships();
    const filtered = list.filter((i) => i.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_INTERNSHIPS, JSON.stringify(filtered));
    }
    notifyChange();
    return true;
  }

  // APPLICATIONS
  async getApplications(): Promise<Application[]> {
    try {
      const remote = await api.getApplications();
      if (remote && Array.isArray(remote)) {
        this.isBackendOnline = true;
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(remote));
        }
        return remote;
      }
    } catch {
      this.isBackendOnline = false;
    }

    if (typeof window === "undefined") return INITIAL_APPLICATIONS;
    const stored = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
    if (!stored) {
      localStorage.setItem(
        STORAGE_KEY_APPLICATIONS,
        JSON.stringify(INITIAL_APPLICATIONS)
      );
      return INITIAL_APPLICATIONS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_APPLICATIONS;
    }
  }

  async saveApplication(app: Partial<Application>): Promise<Application> {
    let created: Application;

    try {
      created = await api.createApplication(app);
      this.isBackendOnline = true;
      const list = await this.getApplications();
      const updated = [created, ...list.filter((a) => a.id !== created.id)];
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(updated));
      }
      notifyChange();
      return created;
    } catch {
      this.isBackendOnline = false;
    }

    const list = await this.getApplications();
    created = {
      id: app.id || `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      internship_id: app.internship_id || null,
      company: app.company || "Company",
      role: app.role || "Role",
      status: app.status || "Saved",
      applied_date: app.applied_date || null,
      interview_date: app.interview_date || null,
      deadline: app.deadline || null,
      match_score: app.match_score ?? null,
      next_action: app.next_action || null,
      notes: app.notes || null,
      job_url: app.job_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updated = [created, ...list];
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(updated));
    }
    notifyChange();
    return created;
  }

  async updateApplication(
    id: string,
    updates: Partial<Application>
  ): Promise<Application | null> {
    try {
      const res = await api.updateApplication(id, updates);
      this.isBackendOnline = true;
      const list = await this.getApplications();
      const idx = list.findIndex((a) => a.id === id);
      if (idx !== -1) list[idx] = res;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(list));
      }
      notifyChange();
      return res;
    } catch {
      this.isBackendOnline = false;
    }

    const list = await this.getApplications();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    const modified = {
      ...list[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    list[idx] = modified;

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(list));
    }
    notifyChange();
    return modified;
  }

  async deleteApplication(id: string): Promise<boolean> {
    try {
      await api.deleteApplication(id);
      this.isBackendOnline = true;
    } catch {
      this.isBackendOnline = false;
    }

    const list = await this.getApplications();
    const filtered = list.filter((a) => a.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(filtered));
    }
    notifyChange();
    return true;
  }

  // METRICS COMPUTATION (Always derived from live dataset or fallback)
  async computeDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const remoteStats = await api.getDashboardStats();
      if (remoteStats && typeof remoteStats.savedInternshipsCount === "number") {
        return remoteStats;
      }
    } catch {
      // calculate fallback
    }

    const [internships, applications] = await Promise.all([
      this.getInternships(),
      this.getApplications()
    ]);

    const savedInternshipsCount = internships.filter((i) => i.is_saved).length;
    const applicationsSubmittedCount = applications.filter((a) =>
      ["Applied", "Assessment", "Interview", "Selected", "Rejected"].includes(
        a.status
      )
    ).length;
    const interviewsScheduledCount = applications.filter(
      (a) => a.status === "Interview"
    ).length;

    // Upcoming deadlines: within next 30 days
    const now = new Date();
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(now.getDate() + 30);

    const upcomingDeadlinesCount = internships.filter((i) => {
      if (!i.deadline) return false;
      const d = new Date(i.deadline);
      return d >= now && d <= thirtyDaysAhead;
    }).length;

    const statusCounts: Record<ApplicationStatus, number> = {
      Saved: 0,
      Applied: 0,
      Assessment: 0,
      Interview: 0,
      Selected: 0,
      Rejected: 0
    };

    let totalScore = 0;
    let scoreCount = 0;

    applications.forEach((a) => {
      if (statusCounts[a.status] !== undefined) {
        statusCounts[a.status]++;
      }
      if (a.match_score) {
        totalScore += a.match_score;
        scoreCount++;
      }
    });

    const averageMatchScore =
      scoreCount > 0 ? Math.round(totalScore / scoreCount) : 85;

    return {
      savedInternshipsCount,
      applicationsSubmittedCount,
      interviewsScheduledCount,
      upcomingDeadlinesCount,
      statusCounts,
      averageMatchScore
    };
  }

  // PROFILE
  async fetchStudentProfile(): Promise<StudentProfile> {
    try {
      const remote = await api.getProfile();
      if (remote) {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(remote));
        }
        return remote;
      }
    } catch {
      // fallback
    }
    return this.getStudentProfile();
  }

  getStudentProfile(): StudentProfile {
    if (typeof window === "undefined") return INITIAL_PROFILE;
    const stored = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!stored) return INITIAL_PROFILE;
    try {
      const parsed = JSON.parse(stored) as Partial<StudentProfile>;

      return {
        ...INITIAL_PROFILE,
        ...parsed,
        id: String(parsed.id ?? INITIAL_PROFILE.id),
        email: String(parsed.email ?? INITIAL_PROFILE.email),
        full_name: String(parsed.full_name ?? INITIAL_PROFILE.full_name),
        university: String(parsed.university ?? INITIAL_PROFILE.university),
        degree: String(parsed.degree ?? INITIAL_PROFILE.degree),
        graduation_year: Number(parsed.graduation_year ?? INITIAL_PROFILE.graduation_year),
        skills: Array.isArray(parsed.skills) ? parsed.skills : INITIAL_PROFILE.skills,
        preferred_roles: Array.isArray(parsed.preferred_roles)
          ? parsed.preferred_roles
          : INITIAL_PROFILE.preferred_roles,
        preferred_locations: Array.isArray(parsed.preferred_locations)
          ? parsed.preferred_locations
          : INITIAL_PROFILE.preferred_locations,
        preferred_work_modes: Array.isArray(parsed.preferred_work_modes)
          ? parsed.preferred_work_modes
          : INITIAL_PROFILE.preferred_work_modes
      };
    } catch {
      return INITIAL_PROFILE;
    }
  }

  async saveStudentProfile(profile: StudentProfile): Promise<void> {
    const sanitizedProfile = {
      ...INITIAL_PROFILE,
      ...profile,
      id: profile.id || INITIAL_PROFILE.id,
      email: profile.email || INITIAL_PROFILE.email,
      full_name: profile.full_name || INITIAL_PROFILE.full_name,
      university: profile.university || INITIAL_PROFILE.university,
      degree: profile.degree || INITIAL_PROFILE.degree,
      graduation_year: Number(profile.graduation_year) || INITIAL_PROFILE.graduation_year,
      skills: Array.isArray(profile.skills) && profile.skills.length ? profile.skills : INITIAL_PROFILE.skills,
      preferred_roles: Array.isArray(profile.preferred_roles) && profile.preferred_roles.length
        ? profile.preferred_roles
        : INITIAL_PROFILE.preferred_roles,
      preferred_locations: Array.isArray(profile.preferred_locations) && profile.preferred_locations.length
        ? profile.preferred_locations
        : INITIAL_PROFILE.preferred_locations,
      preferred_work_modes: Array.isArray(profile.preferred_work_modes) && profile.preferred_work_modes.length
        ? profile.preferred_work_modes
        : INITIAL_PROFILE.preferred_work_modes
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(sanitizedProfile));
    }
    try {
      await api.updateProfile(sanitizedProfile);
      this.isBackendOnline = true;
    } catch {
      // offline fallback is preserved in localStorage
    }
    notifyChange();
  }

  // RESET & EXPORT
  resetDemoData(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_KEY_INTERNSHIPS,
        JSON.stringify(INITIAL_INTERNSHIPS)
      );
      localStorage.setItem(
        STORAGE_KEY_APPLICATIONS,
        JSON.stringify(INITIAL_APPLICATIONS)
      );
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(INITIAL_PROFILE));
      notifyChange();
    }
  }

  async exportDataJson(): Promise<string> {
    const [internships, applications, profile] = await Promise.all([
      this.getInternships(),
      this.getApplications(),
      this.getStudentProfile()
    ]);
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        profile,
        internships,
        applications
      },
      null,
      2
    );
  }

  // DETERMINISTIC CLIENT-SIDE FALLBACKS
  deterministicAnalyzeJob(text: string, jobUrl?: string): JobAnalysis {
    const lines = text.split("\n").map((l: string) => l.trim()).filter(Boolean);
    const textLower = text.toLowerCase();

    // Detect Role
    let role = "Software Engineering Intern";
    const roleLine = lines.find((l: string) => /intern|internship|fellow|co-op/i.test(l));
    if (roleLine && roleLine.length < 80) {
      role = roleLine.replace(/^[#*•-\s]+/, "").trim();
    }

    // Detect Company
    let company: string | null = null;
    const techCos = [
      "Microsoft", "Google", "Amazon", "Apple", "Meta", "NVIDIA", "Stripe",
      "Atlassian", "Figma", "OpenAI", "Anthropic", "Spotify", "Datadog"
    ];
    for (const co of techCos) {
      if (new RegExp(`\\b${co}\\b`, "i").test(text)) {
        company = co;
        break;
      }
    }

    // Detect Skills
    const knownSkills = [
      "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
      "C++", "Java", "Go", "SQL", "PostgreSQL", "PyTorch", "TensorFlow",
      "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "REST APIs",
      "GraphQL", "Tailwind CSS", "HTML5", "CSS3", "Figma", "NLP",
      "Machine Learning", "Algorithms", "System Design"
    ];
    const foundSkills = knownSkills.filter((s) =>
      new RegExp(`\\b${s.replace("+", "\\+")}\\b`, "i").test(textLower)
    );

    const required_skills =
      foundSkills.length > 3
        ? foundSkills.slice(0, Math.ceil(foundSkills.length * 0.65))
        : foundSkills;
    const preferred_skills =
      foundSkills.length > 3
        ? foundSkills.slice(Math.ceil(foundSkills.length * 0.65))
        : [];

    // Work Mode
    let work_mode = "Not specified";
    if (/\bremote\b/i.test(textLower)) work_mode = "Remote";
    else if (/\bhybrid\b/i.test(textLower)) work_mode = "Hybrid";
    else if (/\b(on-site|onsite|in-person)\b/i.test(textLower))
      work_mode = "On-site";

    // Salary
    let stipend = "Not specified";
    const salMatch = text.match(
      /(\$\d+[\d,]*(?:\.\d{2})?\s*(?:\/hr|\/hour|\/mo|\/month|\/yr|k|- \$\d+[\d,]*(?:\/hr|\/hour|\/mo|\/month|\/yr|k)?))/i
    );
    if (salMatch) stipend = salMatch[1];

    // Deadline
    let deadline = "Not specified";
    const dlMatch = text.match(
      /(?:deadline|apply by|applications close):\s*([A-Za-z0-9\s,]+)/i
    );
    if (dlMatch) deadline = dlMatch[1].trim();

    return {
      role,
      company: company || "Technology Company",
      experience_requirement: "0-1 years / Current University Student",
      eligibility_criteria:
        "Enrolled in a Bachelor's, Master's, or PhD in Computer Science or related STEM field.",
      required_skills,
      preferred_skills,
      responsibilities: [
        "Collaborate with senior engineers to design and implement resilient services.",
        "Write clean, maintainable, and well-tested code following best practices.",
        "Participate in sprint standups, planning, and technical retrospectives."
      ],
      location: work_mode === "Remote" ? "Remote / Distributed" : "Hybrid Office",
      work_mode,
      stipend_or_salary: stipend,
      application_deadline: deadline,
      important_qualifications: [
        "Strong fundamentals in data structures, algorithms, and modular design.",
        "Demonstrated project or coursework experience in modern web or backend architectures."
      ],
      summary: `Opportunity for ${role} at ${
        company || "the engineering team"
      }. Primary requirements focus on ${
        required_skills.slice(0, 3).join(", ") || "core programming fundamentals"
      }.`,
      is_demo: true,
      model_used: "deterministic-client-engine"
    };
  }

  deterministicMatchResume(
    resumeText: string,
    role: string,
    company?: string,
    requiredSkills: string[] = [],
    preferredSkills: string[] = []
  ): ResumeMatchResult {
    const textLower = resumeText.toLowerCase();

    const matchedReq = requiredSkills.filter((s) =>
      new RegExp(`\\b${s.toLowerCase().replace("+", "\\+")}\\b`, "i").test(
        textLower
      )
    );
    const missingReq = requiredSkills.filter((s) => !matchedReq.includes(s));

    const prefFound = preferredSkills.filter((s) =>
      new RegExp(`\\b${s.toLowerCase().replace("+", "\\+")}\\b`, "i").test(
        textLower
      )
    );

    // Scoring formula: 70% Required, 20% Preferred, 10% Baseline Education
    const reqRatio =
      requiredSkills.length > 0
        ? matchedReq.length / requiredSkills.length
        : 1.0;
    const prefRatio =
      preferredSkills.length > 0
        ? prefFound.length / preferredSkills.length
        : 0.75;

    const hasDegree = /bachelor|master|b\.s|m\.s|computer science|engineering|university|gpa/i.test(
      textLower
    );
    const hasProjects = /project|developed|built|architected|implemented|github/i.test(
      textLower
    );

    let eduBonus = 0;
    if (hasDegree) eduBonus += 5;
    if (hasProjects) eduBonus += 5;

    const rawScore = Math.round(
      reqRatio * 70 + prefRatio * 20 + eduBonus
    );
    const match_score = Math.max(15, Math.min(98, rawScore));

    // Experience evidence extracts
    const sentences = resumeText
      .split(/[.\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 25);
    const relevant_experience_evidence = sentences
      .filter((s) =>
        matchedReq.some((req) => s.toLowerCase().includes(req.toLowerCase()))
      )
      .slice(0, 3);

    if (relevant_experience_evidence.length === 0) {
      relevant_experience_evidence.push(
        "Demonstrated engineering projects and relevant technical coursework highlighted on resume."
      );
    }

    const resume_improvement_suggestions = [
      missingReq.length > 0
        ? `Highlight hands-on project experience with missing requirements: ${missingReq
            .slice(0, 3)
            .join(", ")}.`
        : "Add quantifiable metrics to existing project bullet points (e.g. latency reduced by X%, users served).",
      "Ensure technical skills are explicitly listed in both a dedicated skills section and contextual project descriptions.",
      "Include direct links to live GitHub repositories or deployed demo URLs."
    ];

    return {
      match_score,
      matched_required_skills: matchedReq,
      missing_required_skills: missingReq,
      preferred_skills_found: prefFound,
      relevant_experience_evidence,
      education_observations: [
        hasDegree
          ? "Academic enrollment in Computer Science or STEM degree detected."
          : "Degree information was not prominently detected in extracted resume text."
      ],
      resume_improvement_suggestions,
      recommended_skills_to_learn:
        missingReq.length > 0
          ? missingReq.slice(0, 4)
          : ["System Architecture Fundamentals", "Automated CI/CD Workflows"],
      scoring_explanation: `Transparent scoring formula: 70% Required Skills (${matchedReq.length}/${
        requiredSkills.length
      } matched), 20% Preferred Skills (${prefFound.length}/${
        preferredSkills.length || 1
      } matched), 10% Academic/Project baseline. Note: This metric evaluates textual screening alignment, not hiring decisions.`,
      is_demo: true,
      model_used: "deterministic-client-engine"
    };
  }
}

export const store = new DataStore();
