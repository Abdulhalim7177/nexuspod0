-- ============================================
-- Migration: 002_create_pods
-- Purpose: Create pods table - core multi-tenant entity
-- ============================================

CREATE TABLE public.pods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  npn TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  social_links JSONB DEFAULT '{}'::jsonb,
  founder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.pods ENABLE ROW LEVEL SECURITY;

-- Generate NPN (NP-XXXXX)
CREATE OR REPLACE FUNCTION public.generate_npn()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  random_suffix TEXT;
  npn_text TEXT;
  exists_check BOOLEAN;
BEGIN
  random_suffix := upper(substring(md5(random()::text) from 1 for 5));
  npn_text := 'NP-' || random_suffix;
  SELECT EXISTS(SELECT 1 FROM public.pods WHERE npn = npn_text) INTO exists_check;
  WHILE exists_check LOOP
    random_suffix := upper(substring(md5(random()::text) from 1 for 5));
    npn_text := 'NP-' || random_suffix;
    SELECT EXISTS(SELECT 1 FROM public.pods WHERE npn = npn_text) INTO exists_check;
  END LOOP;
  NEW.npn := npn_text;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_npn_before_insert
  BEFORE INSERT ON public.pods
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_npn();

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION public.update_pods_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_pods_updated_at
  BEFORE UPDATE ON public.pods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pods_updated_at();

CREATE INDEX idx_pods_founder ON public.pods(founder_id);
CREATE INDEX idx_pods_npn ON public.pods(npn);
