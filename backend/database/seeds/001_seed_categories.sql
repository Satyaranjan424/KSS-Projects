-- ============================================================================
-- KALPANAAM SOFTWARE SOLUTIONS PVT LTD
-- Seed 001: Seed Company Categories
-- ============================================================================

-- Ensure extensions and categories table exist before inserting
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.categories (id, name, slug, description)
VALUES 
    ('11111111-1111-1111-1111-111111111101', 'Healthcare', 'healthcare', 'Clinical portals, telehealth, and healthcare administration solutions'),
    ('11111111-1111-1111-1111-111111111102', 'Education', 'education', 'Learning management, school operations, and student portals'),
    ('11111111-1111-1111-1111-111111111103', 'Enterprise', 'enterprise', 'Business management, CRM, ERP, and workforce automation systems'),
    ('11111111-1111-1111-1111-111111111104', 'AI / ML', 'ai-ml', 'Machine learning models, speech AI, and computer vision systems'),
    ('11111111-1111-1111-1111-111111111105', 'Supply Chain', 'supply-chain', 'Fleet telematics, routing algorithms, and shipment tracking'),
    ('11111111-1111-1111-1111-111111111106', 'FinTech', 'fintech', 'Core banking, transaction processing, and finance portals'),
    ('11111111-1111-1111-1111-111111111107', 'Retail', 'retail', 'Point-of-sale, inventory tracking, and multi-store commerce'),
    ('11111111-1111-1111-1111-111111111108', 'Real Estate', 'real-estate', 'Property listings, lead management, and digital agreements'),
    ('11111111-1111-1111-1111-111111111109', 'Cybersecurity', 'cybersecurity', 'SIEM monitoring, threat detection, and KYC authentication'),
    ('11111111-1111-1111-1111-111111111110', 'CleanTech', 'cleantech', 'Smart grid forecasting, IoT telemetry, and carbon accounting')
ON CONFLICT (slug) DO UPDATE
SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

