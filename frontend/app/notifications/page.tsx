"use client";

import React, { useEffect, useState } from "react";
import { Bell, CalendarClock, Check, CircleDot, Send } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { store } from "@/lib/storage";

interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  date: string | null;
  kind: "application" | "deadline";
}

const READ_NOTIFICATIONS_KEY = "internship_tracker_read_notifications";

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      const [applications, internships] = await Promise.all([
        store.getApplications(),
        store.getInternships()
      ]);
      const now = new Date();
      const deadlineItems = internships.flatMap((internship) => {
        if (!internship.deadline) return [];
        const deadline = new Date(internship.deadline);
        const days = Math.ceil((deadline.getTime() - now.getTime()) / 86400000);
        if (days < 0 || days > 14) return [];
        return [{
          id: `deadline-${internship.id}`,
          title: `${internship.role} deadline coming up`,
          detail: `${internship.company} · ${days === 0 ? "Due today" : `${days} days remaining`}`,
          date: internship.deadline,
          kind: "deadline" as const
        }];
      });
      const applicationItems = applications.map((application) => ({
        id: `application-${application.id}`,
        title: `${application.company} application ${application.status.toLowerCase()}`,
        detail: application.role,
        date: application.updated_at || application.created_at || application.applied_date || null,
        kind: "application" as const
      }));
      setItems([...deadlineItems, ...applicationItems].sort((a, b) => (b.date || "").localeCompare(a.date || "")));
      const stored = localStorage.getItem(READ_NOTIFICATIONS_KEY);
      if (stored) {
        try {
          setReadIds(JSON.parse(stored) as string[]);
        } catch {
          localStorage.removeItem(READ_NOTIFICATIONS_KEY);
        }
      }
      setIsLoading(false);
    };

    void loadNotifications();
  }, []);

  const markRead = (id: string) => {
    setReadIds((current) => {
      const next = current.includes(id) ? current : [...current, id];
      localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const markAllRead = () => {
    const next = items.map((item) => item.id);
    setReadIds(next);
    localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(next));
  };

  const unreadCount = items.filter((item) => !readIds.includes(item.id)).length;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase text-[#7DD3FC]">
              <Bell className="h-4 w-4" /> Activity feed
            </p>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="mt-1 text-sm text-slate-400">Application updates and deadlines from your tracker.</p>
          </div>
          {unreadCount > 0 && <Button variant="outline" size="sm" onClick={markAllRead}><Check className="mr-1.5 h-4 w-4" />Mark all read</Button>}
        </header>

        <div className="space-y-3">
          {isLoading ? (
            <GlassCard className="p-6 text-sm text-slate-400">Loading your updates…</GlassCard>
          ) : items.length === 0 ? (
            <GlassCard className="p-10 text-center">
              <Bell className="mx-auto mb-3 h-7 w-7 text-slate-400" />
              <h2 className="text-base font-semibold text-white">You’re all caught up</h2>
              <p className="mt-1 text-sm text-slate-400">New application activity and approaching deadlines will appear here.</p>
            </GlassCard>
          ) : items.map((item) => {
            const isRead = readIds.includes(item.id);
            const Icon = item.kind === "deadline" ? CalendarClock : Send;
            return (
              <GlassCard key={item.id} className={`flex items-start gap-4 p-4 ${isRead ? "opacity-65" : ""}`}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-[#7DD3FC]">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!isRead && <CircleDot className="h-3 w-3 shrink-0 text-[#22D3EE]" />}
                    <h2 className="truncate text-sm font-semibold text-white">{item.title}</h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
                  {item.date && <time className="mt-2 block text-[11px] text-slate-500">{new Date(item.date).toLocaleDateString()}</time>}
                </div>
                {!isRead && <Button variant="ghost" size="sm" onClick={() => markRead(item.id)} aria-label={`Mark ${item.title} as read`}><Check className="h-4 w-4" /></Button>}
              </GlassCard>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}