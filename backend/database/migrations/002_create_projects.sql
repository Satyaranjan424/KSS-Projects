-- ============================================================================
-- KALPANAAM SOFTWARE SOLUTIONS PVT LTD
-- Migration 002: Create Projects Table
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

-- Ensure columns exist even if table was created in an earlier migration
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS preview_image_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS image_public_id TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS logo_public_id TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON public.projects;
CREATE TRIGGER trigger_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

