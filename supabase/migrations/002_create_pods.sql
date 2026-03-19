-- ============================================
-- Migration: 002_create_pods
-- Purpose: Create pods table - the core multi-tenant entity
-- ============================================

-- 1. Create pods table
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

COMMENT ON TABLE public.pods IS 'Multi-tenant workspace entities - the core organizational unit of Nexus Pod.';

-- 2. Enable Row Level Security
ALTER TABLE public.pods ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for pods (basic - will be enhanced after pod_members exists)

-- Anyone authenticated can create a pod
CREATE POLICY "pods_insert_authenticated"
  ON public.pods
  FOR INSERT
  TO authenticated
  WITH CHECK (founder_id = auth.uid());

-- Only founder can update their pod
CREATE POLICY "pods_update_founder"
  ON public.pods
  FOR UPDATE
  TO authenticated
  USING (founder_id = auth.uid())
  WITH CHECK (founder_id = auth.uid());

-- Only founder can delete their pod
CREATE POLICY "pods_delete_founder"
  ON public.pods
  FOR DELETE
  TO authenticated
  USING (founder_id = auth.uid());

-- 4. Function to generate NPN (NP-XXXXX format)
CREATE OR REPLACE FUNCTION public.generate_npn()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  random_suffix TEXT;
  npn_text TEXT;
  exists_check BOOLEAN;
BEGIN
  random_suffix := upper(
    substring(md5(random()::text) from 1 for 5)
  );
  npn_text := 'NP-' || random_suffix;

  SELECT EXISTS(SELECT 1 FROM public.pods WHERE npn = npn_text) INTO exists_check;
  WHILE exists_check LOOP
    random_suffix := upper(
      substring(md5(random()::text) from 1 for 5)
    );
    npn_text := 'NP-' || random_suffix;
    SELECT EXISTS(SELECT 1 FROM public.pods WHERE npn = npn_text) INTO exists_check;
  END LOOP;

  NEW.npn := npn_text;
  RETURN NEW;
END;
$$;

-- 5. Trigger to auto-generate NPN on pod creation
CREATE TRIGGER generate_npn_before_insert
  BEFORE INSERT ON public.pods
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_npn();

-- 6. Auto-update updated_at timestamp
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

-- 7. Indexes for performance
CREATE INDEX idx_pods_founder ON public.pods(founder_id);
CREATE INDEX idx_pods_npn ON public.pods(npn);
