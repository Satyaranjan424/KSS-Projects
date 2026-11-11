-- ============================================================================
-- KALPANAAA SOFTWARE SOLUTIONS PVT LTD - COMPANY PROJECTS DATABASE SCHEMA
-- Migration: 01_initial_schema.sql
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for category lookup by slug and name
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories (slug);
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories (name);

-- ============================================================================
-- 2. PROJECTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Live',
    technologies TEXT[] NOT NULL DEFAULT '{}',
    preview_image_url TEXT,
    preview_type VARCHAR(100) DEFAULT 'generic',
    icon VARCHAR(100) DEFAULT 'layers',
    logo_url TEXT,
    live_url TEXT,
    figma_url TEXT,
    documentation_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_project_status CHECK (status IN ('Live', 'In Development', 'Archived'))
);

-- Ensure columns exist even if table was created previously without them
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS preview_image_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS image_public_id TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS logo_public_id TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Performance & Query Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON public.projects (category_id);
CREATE INDEX IF NOT EXISTS idx_projects_category_name ON public.projects (category_name);
CREATE INDEX IF NOT EXISTS idx_projects_name ON public.projects (name);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects (slug);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON public.projects (is_featured);

-- Full-text search index across project name and description
CREATE INDEX IF NOT EXISTS idx_projects_fts ON public.projects 
USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || category_name));

-- Auto-update updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON public.projects;
CREATE TRIGGER trigger_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_categories_updated_at ON public.categories;
CREATE TRIGGER trigger_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Categories: Public read access
DROP POLICY IF EXISTS "Public categories read access" ON public.categories;
CREATE POLICY "Public categories read access"
ON public.categories FOR SELECT
TO anon, authenticated
USING (true);

-- Categories: Authenticated/Service Role write access
DROP POLICY IF EXISTS "Admin categories insert access" ON public.categories;
CREATE POLICY "Admin categories insert access"
ON public.categories FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin categories update access" ON public.categories;
CREATE POLICY "Admin categories update access"
ON public.categories FOR UPDATE
TO authenticated, service_role
USING (true);

DROP POLICY IF EXISTS "Admin categories delete access" ON public.categories;
CREATE POLICY "Admin categories delete access"
ON public.categories FOR DELETE
TO authenticated, service_role
USING (true);

-- Projects: Public read access
DROP POLICY IF EXISTS "Public projects read access" ON public.projects;
CREATE POLICY "Public projects read access"
ON public.projects FOR SELECT
TO anon, authenticated
USING (true);

-- Projects: Authenticated/Service Role write access
DROP POLICY IF EXISTS "Admin projects insert access" ON public.projects;
CREATE POLICY "Admin projects insert access"
ON public.projects FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin projects update access" ON public.projects;
CREATE POLICY "Admin projects update access"
ON public.projects FOR UPDATE
TO authenticated, service_role
USING (true);

DROP POLICY IF EXISTS "Admin projects delete access" ON public.projects;
CREATE POLICY "Admin projects delete access"
ON public.projects FOR DELETE
TO authenticated, service_role
USING (true);

-- ============================================================================
-- 4. SUPABASE STORAGE BUCKET CONFIGURATION
-- ============================================================================
-- Insert storage bucket for company project assets if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'company-project-assets',
    'company-project-assets',
    true,
    26214400, -- 25MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET 
    allowed_mime_types = EXCLUDED.allowed_mime_types,
    file_size_limit = EXCLUDED.file_size_limit;

-- Storage Policies: Public Read
DROP POLICY IF EXISTS "Public Storage Access" ON storage.objects;
CREATE POLICY "Public Storage Access"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'company-project-assets');

-- Storage Policies: Authenticated / Service Role Upload & Delete
DROP POLICY IF EXISTS "Admin Storage Upload Access" ON storage.objects;
CREATE POLICY "Admin Storage Upload Access"
ON storage.objects FOR INSERT
TO authenticated, service_role
WITH CHECK (bucket_id = 'company-project-assets');

DROP POLICY IF EXISTS "Admin Storage Delete Access" ON storage.objects;
CREATE POLICY "Admin Storage Delete Access"
ON storage.objects FOR DELETE
TO authenticated, service_role
USING (bucket_id = 'company-project-assets');

