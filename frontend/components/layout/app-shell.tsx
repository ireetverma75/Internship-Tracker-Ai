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
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] flex flex-col font-sans">
      <DemoBanner />
      <div className="flex flex-1 w-full">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Navigation Drawer */}
        <MobileDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />

          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
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
