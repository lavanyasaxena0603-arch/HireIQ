-- ATS Database Schema - Phase 1 Foundation

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- SYSTEM ENUMS
-- ==========================================
CREATE TYPE user_role AS ENUM (
  'SUPER_ADMIN',
  'COMPANY_ADMIN',
  'RECRUITER',
  'HIRING_MANAGER',
  'INTERVIEWER',
  'CANDIDATE'
);

-- ==========================================
-- 1. COMPANIES (Tenants)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. USERS (extends auth.users)
-- ==========================================
-- We store application-level user data here, linked to Supabase Auth.
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. COMPANY MEMBERS (Tenant assignment & RBAC)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.company_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'RECRUITER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- ==========================================
-- 4. CANDIDATE PROFILES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.candidate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  headline TEXT,
  about TEXT,
  location TEXT,
  phone TEXT,
  expected_salary NUMERIC,
  notice_period_days INTEGER,
  github_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TRIGGERS (Auto-update updated_at)
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_members_updated_at
BEFORE UPDATE ON public.company_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidate_profiles_updated_at
BEFORE UPDATE ON public.candidate_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

-- 1. Users can read and update their own user record
CREATE POLICY "Users can view own record" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own record" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 2. Company Members can view their company
CREATE POLICY "Members can view their company" ON public.companies FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE company_members.company_id = companies.id 
    AND company_members.user_id = auth.uid()
  )
);

-- 3. Company Admins can update their company
CREATE POLICY "Admins can update their company" ON public.companies FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE company_members.company_id = companies.id 
    AND company_members.user_id = auth.uid()
    AND company_members.role = 'COMPANY_ADMIN'
  )
);

-- 4. Members can view other members in their company
CREATE POLICY "Members can view company members" ON public.company_members FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.company_members AS me 
    WHERE me.company_id = company_members.company_id 
    AND me.user_id = auth.uid()
  )
);

-- 5. Candidates can view and manage their own profile
CREATE POLICY "Candidates manage own profile" ON public.candidate_profiles 
FOR ALL USING (auth.uid() = user_id);

-- Note: We will add policies for Recruiters viewing Candidate Profiles later
-- once we introduce Applications, so recruiters can only see candidates
-- who have applied to their jobs, or are in their talent pool.

-- ==========================================
-- 5. APPLICATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL, -- For MVP, this might be a dummy UUID
  status TEXT NOT NULL DEFAULT 'Applied',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can view own applications" ON public.applications 
FOR SELECT USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates can insert own applications" ON public.applications 
FOR INSERT WITH CHECK (auth.uid() = candidate_id);

-- ==========================================
-- 6. RESUMES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  parsed_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can view own resumes" ON public.resumes 
FOR SELECT USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates can insert own resumes" ON public.resumes 
FOR INSERT WITH CHECK (auth.uid() = candidate_id);

-- ==========================================
-- AUTO-SYNC USER TRIGGER
-- ==========================================
-- Automatically create a public.users row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
