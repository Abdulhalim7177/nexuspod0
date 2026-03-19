-- ============================================
-- Migration: 010_enable_rls_properly
-- Purpose: Re-enable RLS with proper policies
-- ============================================

-- Enable RLS
ALTER TABLE public.pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_invitations ENABLE ROW LEVEL SECURITY;

-- Pods policies
DROP POLICY IF EXISTS "pods_insert_any_authenticated" ON public.pods;
DROP POLICY IF EXISTS "pods_select_member" ON public.pods;
DROP POLICY IF EXISTS "pods_update_founder" ON public.pods;
DROP POLICY IF EXISTS "pods_delete_founder" ON public.pods;

CREATE POLICY "pods_insert_any_authenticated"
  ON public.pods
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "pods_select_member"
  ON public.pods
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pod_members
      WHERE pod_members.pod_id = pods.id
      AND pod_members.user_id = auth.uid()
    )
  );

CREATE POLICY "pods_update_founder"
  ON public.pods
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pod_members
      WHERE pod_members.pod_id = pods.id
      AND pod_members.user_id = auth.uid()
      AND pod_members.role = 'FOUNDER'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pod_members
      WHERE pod_members.pod_id = pods.id
      AND pod_members.user_id = auth.uid()
      AND pod_members.role = 'FOUNDER'
    )
  );

CREATE POLICY "pods_delete_founder"
  ON public.pods
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pod_members
      WHERE pod_members.pod_id = pods.id
      AND pod_members.user_id = auth.uid()
      AND pod_members.role = 'FOUNDER'
    )
  );

-- Pod members policies
DROP POLICY IF EXISTS "pod_members_select" ON public.pod_members;
DROP POLICY IF EXISTS "pod_members_insert_manager" ON public.pod_members;
DROP POLICY IF EXISTS "pod_members_update_founder" ON public.pod_members;
DROP POLICY IF EXISTS "pod_members_delete_founder" ON public.pod_members;

CREATE POLICY "pod_members_select"
  ON public.pod_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pod_members pm
      WHERE pm.pod_id = pod_members.pod_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "pod_members_insert_manager"
  ON public.pod_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pod_members pm
      WHERE pm.pod_id = pod_members.pod_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('FOUNDER', 'POD_MANAGER')
    )
  );

CREATE POLICY "pod_members_update_founder"
  ON public.pod_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pod_members pm
      WHERE pm.pod_id = pod_members.pod_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'FOUNDER'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pod_members pm
      WHERE pm.pod_id = pod_members.pod_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'FOUNDER'
    )
  );

CREATE POLICY "pod_members_delete_founder"
  ON public.pod_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pod_members pm
      WHERE pm.pod_id = pod_members.pod_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'FOUNDER'
    )
  );

-- Pod invitations policies
DROP POLICY IF EXISTS "pod_invitations_select" ON public.pod_invitations;
DROP POLICY IF EXISTS "pod_invitations_insert_manager" ON public.pod_invitations;
DROP POLICY IF EXISTS "pod_invitations_update_founder" ON public.pod_invitations;
DROP POLICY IF EXISTS "pod_invitations_delete_founder" ON public.pod_invitations;

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
  );

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
  );
