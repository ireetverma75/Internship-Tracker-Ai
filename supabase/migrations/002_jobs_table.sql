-- Migration: 002_jobs_table.sql
-- Description: Jobs table for Hugging Face Jobs Tabular Dataset integration

CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_title TEXT NOT NULL,
    company TEXT NOT NULL,
    job_type TEXT,
    description TEXT,
    qualifications TEXT,
    duties TEXT,
    pay TEXT,
    source TEXT DEFAULT 'huggingface_jobs_dataset',
    is_synthetic BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_jobs_job_title ON public.jobs(job_title);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON public.jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON public.jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_is_synthetic ON public.jobs(is_synthetic);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to jobs dataset
CREATE POLICY "jobs_read_policy" ON public.jobs
    FOR SELECT USING (true);
