"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Internship } from "@/types";
import { store } from "@/lib/storage";
import { toast } from "sonner";

interface InternshipFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Internship | null;
  onSuccess?: (item: Internship) => void;
}

export const InternshipFormModal: React.FC<InternshipFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSuccess
}) => {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("Remote");
  const [workMode, setWorkMode] = useState("Remote");
  const [stipend, setStipend] = useState("");
  const [deadline, setDeadline] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [preferredSkills, setPreferredSkills] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setCompany(initialData.company || "");
      setRole(initialData.role || "");
      setLocation(initialData.location || "Remote");
      setWorkMode(initialData.work_mode || "Remote");
      setStipend(initialData.stipend || "");
      setDeadline(initialData.deadline ? initialData.deadline.split("T")[0] : "");
      setJobUrl(initialData.job_url || "");
      setRequiredSkills((initialData.required_skills || []).join(", "));
      setPreferredSkills((initialData.preferred_skills || []).join(", "));
      setEligibility(initialData.eligibility || "");
      setDescription(initialData.description || "");
      setNotes(initialData.notes || "");
    } else {
      setCompany("");
      setRole("");
      setLocation("Remote");
      setWorkMode("Remote");
      setStipend("");
      setDeadline("");
      setJobUrl("");
      setRequiredSkills("");
      setPreferredSkills("");
      setEligibility("");
      setDescription("");
      setNotes("");
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!company.trim()) newErrors.company = "Company name is required";
    if (!role.trim()) newErrors.role = "Role title is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Internship> = {
        company: company.trim(),
        role: role.trim(),
        location: location.trim() || "Remote",
        work_mode: workMode,
        stipend: stipend.trim() || undefined,
        deadline: deadline || undefined,
        job_url: jobUrl.trim() || undefined,
        required_skills: requiredSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        preferred_skills: preferredSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        eligibility: eligibility.trim() || undefined,
        description: description.trim() || undefined,
        notes: notes.trim() || undefined,
        is_saved: true
      };

      let result: Internship;
      if (initialData?.id) {
        const updated = await store.updateInternship(initialData.id, payload);
        if (!updated) throw new Error("Could not update internship");
        result = updated;
        toast.success(`Updated opportunity at ${result.company}`);
      } else {
        result = await store.saveInternship(payload);
        toast.success(`Added new opportunity at ${result.company}`);
      }

      onSuccess?.(result);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save internship");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Internship Opportunity" : "Add Internship Opportunity"}
      description="Track requirements, application deadlines, and skills for this role."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Company Name *
            </label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Microsoft, Stripe, OpenAI"
              error={errors.company}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Role Title *
            </label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Software Engineering Intern"
              error={errors.role}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Work Mode
            </label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-700/80 bg-[#111827] px-3 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#4F7CFF]"
            >
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Location
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Seattle, WA or Remote"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Stipend / Compensation
            </label>
            <Input
              value={stipend}
              onChange={(e) => setStipend(e.target.value)}
              placeholder="e.g. $52/hr"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Application Deadline
            </label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Official Posting URL
            </label>
            <Input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Required Skills (comma separated)
          </label>
          <Input
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
            placeholder="Python, React, TypeScript, Docker"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Preferred Skills (comma separated)
          </label>
          <Input
            value={preferredSkills}
            onChange={(e) => setPreferredSkills(e.target.value)}
            placeholder="Kubernetes, PyTorch, GraphQL"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Eligibility Requirements
          </label>
          <Input
            value={eligibility}
            onChange={(e) => setEligibility(e.target.value)}
            placeholder="e.g. Enrolled in Bachelor's or Master's graduating in 2026/2027"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Job Description & Overview
          </label>
          <Textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Summary of responsibilities and qualifications..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Personal Notes & Interview Tips
          </label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Connected with campus recruiter, requires online assessment"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {initialData ? "Save Changes" : "Create Opportunity"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
