import type { Metadata } from "next";
import { Toaster } from "sonner";
import { GlobalAuroraBackground } from "@/components/layout/GlobalAuroraBackground";
import { GlassPointerLight } from "@/components/layout/GlassPointerLight";
import "./globals.css";

export const metadata: Metadata = {
  title: "Internship Tracker AI — Discovery, Matching & Application Pipeline",
  description:
    "AI-powered platform to discover top tech internships, analyze job requirements, match resumes with high accuracy, and manage application pipelines.",
  keywords: [
    "internship tracker",
    "ai resume match",
    "job description analyzer",
    "software engineering internships",
    "tech careers"
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="liquid-glass-theme antialiased bg-[#050816] text-[#F8FAFC] selection:bg-[#60A5FA] selection:text-white">
        <GlobalAuroraBackground />
        <GlassPointerLight />
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "rgba(12, 18, 38, 0.82)",
              backdropFilter: "blur(24px) saturate(160%)",
              border: "1px solid rgba(255, 255, 255, 0.16)",
              color: "#F8FAFC",
              boxShadow: "0 20px 45px rgba(15, 23, 42, 0.45)"
            }
          }}
        />
      </body>
    </html>
  );
}
