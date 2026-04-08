-- ============================================
-- Migration: 004_create_pod_invitations
-- Purpose: Create invitation system for pods
-- ============================================

CREATE TABLE public.pod_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id UUID NOT NULL REFERENCES public.pods(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  max_uses INTEGER DEFAULT 10,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.pod_invitations ENABLE ROW LEVEL SECURITY;

-- Invitations RLS: SELECT - pod members
CREATE POLICY "pod_invitations_select"
  ON public.pod_invitations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pod_members WHERE pod_id = pod_invitations.pod_id AND user_id = auth.uid()));

-- Invitations RLS: INSERT - managers
CREATE POLICY "pod_invitations_insert"
  ON public.pod_invitations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.pod_members WHERE pod_id = pod_invitations.pod_id AND user_id = auth.uid() AND role IN ('FOUNDER', 'POD_MANAGER')));

-- Invitations RLS: DELETE - founder
CREATE POLICY "pod_invitations_delete"
  ON public.pod_invitations FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pod_members WHERE pod_id = pod_invitations.pod_id AND user_id = auth.uid() AND role = 'FOUNDER'));

-- Generate invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  random_code TEXT;
  code_exists BOOLEAN;
BEGIN
  random_code := upper(substring(md5(random()::text || now()::text) from 1 for 8));
  SELECT EXISTS(SELECT 1 FROM public.pod_invitations WHERE code = random_code) INTO code_exists;
  WHILE code_exists LOOP
    random_code := upper(substring(md5(random()::text || now()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM public.pod_invitations WHERE code = random_code) INTO code_exists;
  END LOOP;
  NEW.code := random_code;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_invite_code_before_insert
  BEFORE INSERT ON public.pod_invitations
  FOR EACH ROW
  WHEN (NEW.code IS NULL)
  EXECUTE FUNCTION public.generate_invite_code();

CREATE INDEX idx_pod_invitations_pod ON public.pod_invitations(pod_id);
CREATE INDEX idx_pod_invitations_code ON public.pod_invitations(code);
