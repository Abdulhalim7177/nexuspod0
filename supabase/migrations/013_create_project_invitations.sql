-- ============================================
-- Migration: 013_create_project_invitations
-- Purpose: Create invitation system for projects
-- ============================================

CREATE TABLE IF NOT EXISTS public.project_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  pod_id UUID NOT NULL REFERENCES public.pods(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  max_uses INTEGER DEFAULT 10,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;

-- Generate invite code for projects
CREATE OR REPLACE FUNCTION public.generate_project_invite_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  random_code TEXT;
  code_exists BOOLEAN;
BEGIN
  random_code := 'PR-' || upper(substring(md5(random()::text || now()::text) from 1 for 6));
  SELECT EXISTS(SELECT 1 FROM public.project_invitations WHERE code = random_code) INTO code_exists;
  WHILE code_exists LOOP
    random_code := 'PR-' || upper(substring(md5(random()::text || now()::text) from 1 for 6));
    SELECT EXISTS(SELECT 1 FROM public.project_invitations WHERE code = random_code) INTO code_exists;
  END LOOP;
  NEW.code := random_code;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_project_invite_code_before_insert
  BEFORE INSERT ON public.project_invitations
  FOR EACH ROW
  WHEN (NEW.code IS NULL)
  EXECUTE FUNCTION public.generate_project_invite_code();

-- SELECT: Pod members can see project invitations for that project
CREATE POLICY "project_invitations_select"
    ON public.project_invitations FOR SELECT TO authenticated
    USING (
        is_active = true -- Allow anyone to see active code to join
        OR
        public.is_pod_member(pod_id, auth.uid()) -- Members can see all codes
    );

-- INSERT/UPDATE/DELETE: Pod Founders, Managers, and Team Leads
CREATE POLICY "project_invitations_manage"
    ON public.project_invitations FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.pod_members 
            WHERE pod_id = project_invitations.pod_id 
            AND user_id = auth.uid() 
            AND role IN ('FOUNDER', 'POD_MANAGER', 'TEAM_LEAD')
        )
    );

CREATE INDEX idx_project_invitations_project ON public.project_invitations(project_id);
CREATE INDEX idx_project_invitations_code ON public.project_invitations(code);
