"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Application, ApplicationStatus } from "@/types";
import { store } from "@/lib/storage";
import { toast } from "sonner";

interface ApplicationCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplicationCreateModal: React.FC<ApplicationCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("Applied");
  const [appliedDate, setAppliedDate] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      setAppliedDate(new Date().toISOString().split("T")[0]);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) {
      setErrors({ company: "Company is required" });
      return;
    }
    if (!role.trim()) {
      setErrors({ role: "Role is required" });
      return;
    }

    setIsSubmitting(true);
    try {
      await store.saveApplication({
        company: company.trim(),
        role: role.trim(),
        status,
        applied_date: appliedDate || null,
        interview_date: interviewDate || null,
        deadline: deadline || null,
        match_score: 86,
        next_action: nextAction.trim() || null,
        notes: notes.trim() || null
      });
      toast.success(`Tracked application for ${company}`);
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to track application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Track New Application"
      description="Record an internship application to your Kanban pipeline"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Company Name *
          </label>
          <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Anthropic, OpenAI, Apple"
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

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Initial Status Stage
          </label>
          <select
            value={status}
            onChange={(e: any) => setStatus(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-slate-700/80 bg-[#111827] px-3 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#4F7CFF]"
          >
            <option value="Saved">Saved</option>
            <option value="Applied">Applied</option>
            <option value="Assessment">Assessment</option>
            <option value="Interview">Interview</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Applied Date
            </label>
            <Input
              type="date"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Deadline
            </label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Next Action / Step
          </label>
          <Input
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            placeholder="e.g. Awaiting recruiter email, prepare behavioral questions"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Notes
          </label>
          <Textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Referrals, recruiter names, links..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Track Application
          </Button>
        </div>
      </form>
    </Modal>
  );
};
