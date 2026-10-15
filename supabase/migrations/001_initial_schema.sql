-- Migration: 001_initial_schema.sql
-- Description: Core tables for Internship Tracker AI (profiles, internships, applications, resumes) with Row Level Security (RLS)

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    university TEXT,
    degree TEXT,
    graduation_year INTEGER,
    skills TEXT[] DEFAULT '{}',
    preferred_roles TEXT[] DEFAULT '{}',
    preferred_locations TEXT[] DEFAULT '{}',
    preferred_work_modes TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. Internships Table
CREATE TABLE IF NOT EXISTS public.internships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    description TEXT,
    location TEXT DEFAULT 'Remote',
    work_mode TEXT DEFAULT 'Remote',
    stipend TEXT,
    deadline DATE,
    job_url TEXT,
    required_skills TEXT[] DEFAULT '{}',
    preferred_skills TEXT[] DEFAULT '{}',
    eligibility TEXT,
    notes TEXT,
    is_demo BOOLEAN DEFAULT FALSE,
    is_saved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    internship_id UUID REFERENCES public.internships(id) ON DELETE SET NULL,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Saved',
    applied_date DATE,
    interview_date DATE,
    deadline DATE,
    match_score INTEGER,
    next_action TEXT,
    notes TEXT,
    job_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. Resume Metadata Table
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    filename TEXT NOT NULL,
    file_size_bytes INTEGER,
    parsed_text TEXT,
    extracted_skills TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_internships_user_id ON public.internships(user_id);
CREATE INDEX IF NOT EXISTS idx_internships_deadline ON public.internships(deadline);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_deadline ON public.applications(deadline);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Internships Policies (view public/demo or user-owned; insert/update/delete only own)
CREATE POLICY "Users can view public or own internships"
    ON public.internships FOR SELECT
    USING (user_id IS NULL OR user_id = auth.uid() OR is_demo = TRUE);

CREATE POLICY "Users can insert own internships"
    ON public.internships FOR INSERT
    WITH CHECK (user_id = auth.uid() OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own internships"
    ON public.internships FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own internships"
    ON public.internships FOR DELETE
    USING (user_id = auth.uid());

-- Applications Policies
CREATE POLICY "Users can view own applications"
    ON public.applications FOR SELECT
    USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can insert own applications"
    ON public.applications FOR INSERT
    WITH CHECK (user_id = auth.uid() OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own applications"
    ON public.applications FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own applications"
    ON public.applications FOR DELETE
    USING (user_id = auth.uid());

-- Resumes Policies
CREATE POLICY "Users can view own resumes"
    ON public.resumes FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own resumes"
    ON public.resumes FOR INSERT
    WITH CHECK (user_id = auth.uid());
