-- ============================================================================
-- KALPANAAM SOFTWARE SOLUTIONS PVT LTD
-- Migration 003: Indexes, Constraints & Row Level Security Policies
-- ============================================================================

-- 1. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON public.projects (category_id);
CREATE INDEX IF NOT EXISTS idx_projects_category_name ON public.projects (category_name);
CREATE INDEX IF NOT EXISTS idx_projects_name ON public.projects (name);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects (slug);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON public.projects (is_featured);
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON public.projects (display_order ASC);

-- 2. Full-text search index
CREATE INDEX IF NOT EXISTS idx_projects_fts ON public.projects 
USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || category_name));

-- 3. Row Level Security (RLS) Enablement
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Categories RLS Policies
DROP POLICY IF EXISTS "Public categories read access" ON public.categories;
CREATE POLICY "Public categories read access"
ON public.categories FOR SELECT
TO anon, authenticated
USING (true);

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

-- Projects RLS Policies
DROP POLICY IF EXISTS "Public projects read access" ON public.projects;
CREATE POLICY "Public projects read access"
ON public.projects FOR SELECT
TO anon, authenticated
USING (true);

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

-- 4. Storage Bucket Configuration
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

-- Storage Read Policy
DROP POLICY IF EXISTS "Public Storage Access" ON storage.objects;
CREATE POLICY "Public Storage Access"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'company-project-assets');

-- Storage Insert & Delete Policies
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

