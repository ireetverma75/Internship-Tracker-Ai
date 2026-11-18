"use client";

import React, { useState, useEffect } from "react";
import { User, GraduationCap, MapPin, Briefcase, Plus, X, Save, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StudentProfile } from "@/types";
import { store } from "@/lib/storage";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile>(store.getStudentProfile());
  const [fullName, setFullName] = useState(profile.full_name);
  const [email, setEmail] = useState(profile.email);
  const [university, setUniversity] = useState(profile.university);
  const [degree, setDegree] = useState(profile.degree);
  const [graduationYear, setGraduationYear] = useState(profile.graduation_year);
  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [newSkill, setNewSkill] = useState("");
  const [preferredRoles, setPreferredRoles] = useState(profile.preferred_roles.join(", "));
  const [preferredLocations, setPreferredLocations] = useState(profile.preferred_locations.join(", "));
  const [preferredWorkModes, setPreferredWorkModes] = useState<string[]>(profile.preferred_work_modes);

  useEffect(() => {
    api.getProfile().then((remote) => {
      if (remote) {
        if (remote.full_name) setFullName(remote.full_name);
        if (remote.university) setUniversity(remote.university);
        if (remote.degree) setDegree(remote.degree);
        if (remote.graduation_year) setGraduationYear(remote.graduation_year);
        if (remote.skills && remote.skills.length > 0) setSkills(remote.skills);
        if (remote.preferred_roles && remote.preferred_roles.length > 0) setPreferredRoles(remote.preferred_roles.join(", "));
        if (remote.preferred_locations && remote.preferred_locations.length > 0) setPreferredLocations(remote.preferred_locations.join(", "));
        if (remote.preferred_work_modes && remote.preferred_work_modes.length > 0) setPreferredWorkModes(remote.preferred_work_modes);
      }
    }).catch(() => {});
  }, []);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const clean = newSkill.trim();
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleToggleWorkMode = (mode: string) => {
    if (preferredWorkModes.includes(mode)) {
      setPreferredWorkModes(preferredWorkModes.filter((m) => m !== mode));
    } else {
      setPreferredWorkModes([...preferredWorkModes, mode]);
    }
  };

  const handleSave = () => {
    const updated: StudentProfile = {
      ...profile,
      full_name: fullName.trim(),
      email: email.trim(),
      university: university.trim(),
      degree: degree.trim(),
      graduation_year: Number(graduationYear),
      skills,
      preferred_roles: preferredRoles.split(",").map((s) => s.trim()).filter(Boolean),
      preferred_locations: preferredLocations.split(",").map((s) => s.trim()).filter(Boolean),
      preferred_work_modes: preferredWorkModes
    };

    store.saveStudentProfile(updated);
    setProfile(updated);
    toast.success("Profile updated successfully!");
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <User className="h-7 w-7 text-[#2563EB]" />
            <span>Student Career Profile</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Personalize your target internships, degree milestones, and core skill stack.
          </p>
        </div>

        <Button onClick={handleSave} className="self-start sm:self-auto shadow-sm">
          <Save className="h-4 w-4 mr-1.5" />
          <span>Save Changes</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Avatar & Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] text-center shadow-sm space-y-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] mx-auto flex items-center justify-center font-extrabold text-2xl text-white shadow-sm ring-4 ring-slate-100">
              {fullName ? fullName.split(" ").map((n) => n[0]).join("") : "AC"}
            </div>

            <div>
              <h3 className="text-base font-bold text-[#0F172A]">{fullName || "Student Name"}</h3>
              <p className="text-xs text-[#2563EB] font-medium mt-0.5">{degree}</p>
              <p className="text-xs text-[#64748B] mt-0.5">{university}</p>
              <Badge variant="primary" className="mt-2.5">
                Class of {graduationYear}
              </Badge>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] text-left space-y-2 text-xs text-[#64748B]">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#64748B]" />
                <span>Preferred: {preferredLocations || "Flexible"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[#64748B]" />
                <span>Work Mode: {preferredWorkModes.join(", ") || "Any"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Profile Details */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider border-b border-[#E2E8F0] pb-3">
              Academic & Personal Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Full Name
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Student User"
                  className="bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Student Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  University / College
                </label>
                <Input
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="University of Washington"
                  className="bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Degree & Major
                </label>
                <Input
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="B.S. in Computer Science"
                  className="bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Expected Graduation Year
                </label>
                <Input
                  type="number"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(Number(e.target.value))}
                  placeholder="2027"
                  className="bg-[#F8FAFC]"
                />
              </div>
            </div>

            {/* Technical Skills Interactive Tag Editor */}
            <div className="pt-4 border-t border-[#E2E8F0]">
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Technical Skills Stack
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="Type a skill (e.g. PyTorch, Docker, Next.js) and press Enter"
                  className="text-xs bg-[#F8FAFC]"
                />
                <Button type="button" size="sm" onClick={handleAddSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 text-[#2563EB] border border-blue-200"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-[#DC2626]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Target Role Preferences */}
            <div className="pt-4 border-t border-[#E2E8F0] space-y-4">
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                Internship Search Preferences
              </h3>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Preferred Internship Roles (comma separated)
                </label>
                <Input
                  value={preferredRoles}
                  onChange={(e) => setPreferredRoles(e.target.value)}
                  placeholder="Software Engineering Intern, Machine Learning Intern"
                  className="bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Preferred Target Locations (comma separated)
                </label>
                <Input
                  value={preferredLocations}
                  onChange={(e) => setPreferredLocations(e.target.value)}
                  placeholder="Seattle, WA, San Francisco, CA, Remote"
                  className="bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-2">
                  Work Mode Preference
                </label>
                <div className="flex gap-2">
                  {["Remote", "Hybrid", "On-site"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleToggleWorkMode(mode)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        preferredWorkModes.includes(mode)
                          ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm"
                          : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
