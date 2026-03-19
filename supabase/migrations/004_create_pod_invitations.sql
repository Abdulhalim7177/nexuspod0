-- ============================================
-- Migration: 004_create_pod_invitations
-- Purpose: Create invitation system for pods
-- ============================================

-- 1. Create pod_invitations table
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

COMMENT ON TABLE public.pod_invitations IS 'Invitation codes for joining pods.';

-- 2. Enable Row Level Security
ALTER TABLE public.pod_invitations ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for pod_invitations

-- Pod members can view invitations for their pod
CREATE POLICY "pod_invitations_select"
  ON public.pod_invitations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pod_members pm
      WHERE pm.pod_id = pod_invitations.pod_id
      AND pm.user_id = auth.uid()
    )
  );

-- Founder/Manager can create invitations
CREATE POLICY "pod_invitations_insert_manager"
  ON public.pod_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pod_members pm
      WHERE pm.pod_id = pod_invitations.pod_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('FOUNDER', 'POD_MANAGER')
    )
  );

-- Creator or Founder can update/delete
CREATE POLICY "pod_invitations_update_founder"
  ON public.pod_invitations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pod_members pm
      WHERE pm.pod_id = pod_invitations.pod_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'FOUNDER'
    )
    OR created_by = auth.uid()
  );

-- Creator or Founder can delete
CREATE POLICY "pod_invitations_delete_founder"
  ON public.pod_invitations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pod_members pm
      WHERE pm.pod_id = pod_invitations.pod_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'FOUNDER'
    )
    OR created_by = auth.uid()
  );

-- 4. Function to generate invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  random_code TEXT;
  code_exists BOOLEAN;
BEGIN
  random_code := upper(
    substring(md5(random()::text || now()::text) from 1 for 8)
  );

  SELECT EXISTS(SELECT 1 FROM public.pod_invitations WHERE code = random_code) INTO code_exists;
  WHILE code_exists LOOP
    random_code := upper(
      substring(md5(random()::text || now()::text) from 1 for 8)
    );
    SELECT EXISTS(SELECT 1 FROM public.pod_invitations WHERE code = random_code) INTO code_exists;
  END LOOP;

  NEW.code := random_code;
  RETURN NEW;
END;
$$;

-- 5. Trigger to auto-generate code on invitation creation
CREATE TRIGGER generate_invite_code_before_insert
  BEFORE INSERT ON public.pod_invitations
  FOR EACH ROW
  WHEN (NEW.code IS NULL)
  EXECUTE FUNCTION public.generate_invite_code();

-- 6. Indexes for performance
CREATE INDEX idx_pod_invitations_pod ON public.pod_invitations(pod_id);
CREATE INDEX idx_pod_invitations_code ON public.pod_invitations(code);
CREATE INDEX idx_pod_invitations_expires ON public.pod_invitations(expires_at) WHERE expires_at IS NOT NULL;
