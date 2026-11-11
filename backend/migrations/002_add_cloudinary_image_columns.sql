-- Migration: Add Cloudinary image columns to projects table
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/fwehjenvfiuxabozmtee/sql)

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS preview_image_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS image_public_id TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS logo_public_id TEXT;

-- Create an index on image_public_id for fast lookup
CREATE INDEX IF NOT EXISTS idx_projects_image_public_id ON public.projects(image_public_id);

