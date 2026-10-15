import type { Metadata } from "next";
import { Toaster } from "sonner";
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
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0B1020] text-[#F8FAFC]">
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#111827",
              border: "1px solid #1E293B",
              color: "#F8FAFC"
            }
          }}
        />
      </body>
    </html>
  );
}
