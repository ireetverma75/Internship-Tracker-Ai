"use client";

import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { TopNavbar } from "./top-navbar";
import { DemoBanner } from "./demo-banner";
import { MobileDrawer } from "./mobile-drawer";
import { InternshipFormModal } from "@/components/internships/internship-form-modal";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="app-shell min-h-screen bg-transparent text-slate-100 flex flex-col font-sans">
      <DemoBanner />
      <div className="flex flex-1 w-full max-w-[1720px] mx-auto px-2 md:px-4 lg:px-6 gap-3">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Navigation Drawer */}
        <MobileDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent">
          <TopNavbar
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />

          <main className="app-main flex-1 p-4 md:p-6 lg:p-8 w-full mx-auto animate-in fade-in duration-150">
            {children}
          </main>
        </div>
      </div>

      {/* Global Add Opportunity Modal */}
      <InternshipFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
