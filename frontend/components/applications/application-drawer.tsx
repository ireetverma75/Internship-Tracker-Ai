"use client";

import React, { useState, useEffect } from "react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Application, ApplicationStatus } from "@/types";
import { store } from "@/lib/storage";
import { formatDate, getStatusColor } from "@/lib/utils";
import { toast } from "sonner";
import { Calendar, Building, Trash2, ExternalLink } from "lucide-react";

interface ApplicationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
  onUpdated: () => void;
  onDelete: (id: string) => void;
}

const STATUS_OPTIONS: ApplicationStatus[] = [
  "Saved",
  "Applied",
  "Assessment",
  "Interview",
  "Selected",
  "Rejected"
];

export const ApplicationDrawer: React.FC<ApplicationDrawerProps> = ({
  isOpen,
  onClose,
  application,
  onUpdated,
  onDelete
}) => {
  const [status, setStatus] = useState<ApplicationStatus>("Saved");
  const [appliedDate, setAppliedDate] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (application) {
      setStatus(application.status);
      setAppliedDate(application.applied_date || "");
      setInterviewDate(application.interview_date || "");
      setDeadline(application.deadline || "");
      setNextAction(application.next_action || "");
      setNotes(application.notes || "");
    }
  }, [application]);

  if (!application) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await store.updateApplication(application.id, {
        status,
        applied_date: appliedDate || null,
        interview_date: interviewDate || null,
        deadline: deadline || null,
        next_action: nextAction.trim() || null,
        notes: notes.trim() || null
      });
      toast.success(`Updated ${application.company} status to ${status}`);
      onUpdated();
      onClose();
    } catch {
      toast.error("Failed to update application");
    } finally {
      setIsSaving(false);
    }
  };

  const statusStyle = getStatusColor(status);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`${application.company} — Application Details`}
      description={application.role}
    >
      <div className="space-y-5">
        {/* Status Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Application Pipeline Stage
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setStatus(opt)}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all text-center ${
                  status === opt
                    ? `${getStatusColor(opt).bg} ${getStatusColor(opt).text} ${getStatusColor(opt).border} ring-1 ring-[#4F7CFF]`
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Applied Date
            </label>
            <Input
              type="date"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
              className="text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Interview Date
            </label>
            <Input
              type="date"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Application Deadline
          </label>
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="text-xs"
          />
        </div>

        {/* Next Action */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Next Action / Milestone
          </label>
          <Input
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            placeholder="e.g. Prepare system design round, follow up with recruiter"
            className="text-xs"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Application Notes & Interview Reflection
          </label>
          <Textarea
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Log technical questions asked, interview feedback, or recruiter communications..."
            className="text-xs"
          />
        </div>

        {/* Match score indicator if present */}
        {application.match_score && (
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Recorded Resume Match Score:</span>
            <Badge variant="success">{application.match_score}% Match</Badge>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <Button
            variant="outline"
            className="text-rose-400 hover:bg-rose-500/10"
            onClick={() => {
              onDelete(application.id);
              onClose();
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            <span>Delete</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={isSaving}>
              Save Updates
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
