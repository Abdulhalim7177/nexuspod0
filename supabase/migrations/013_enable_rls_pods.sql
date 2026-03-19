-- ============================================
-- Migration: 013_enable_rls_pods
-- Purpose: Enable RLS and fix pod access
-- ============================================

-- Enable RLS
ALTER TABLE public.pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_invitations ENABLE ROW LEVEL SECURITY;

-- Pods: Users can only see pods they are members of
DROP POLICY IF EXISTS "pods_select_member" ON public.pods;
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

-- Pods: Any authenticated user can create
DROP POLICY IF EXISTS "pods_insert_any_authenticated" ON public.pods;
CREATE POLICY "pods_insert_any_authenticated"
  ON public.pods
  FOR INSERT
  TO authenticated
  WITH CHECK (founder_id = auth.uid());

-- Pods: Only founder can update
DROP POLICY IF EXISTS "pods_update_founder" ON public.pods;
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
    founder_id = auth.uid()
  );

-- Pods: Only founder can delete
DROP POLICY IF EXISTS "pods_delete_founder" ON public.pods;
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

-- Pod Members: Users can view members of pods they belong to
DROP POLICY IF EXISTS "pod_members_select" ON public.pod_members;
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

-- Pod Members: Founder/Manager can add members
DROP POLICY IF EXISTS "pod_members_insert_manager" ON public.pod_members;
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

-- Pod Members: Founder can update roles
DROP POLICY IF EXISTS "pod_members_update_founder" ON public.pod_members;
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

-- Pod Members: Founder can delete members
DROP POLICY IF EXISTS "pod_members_delete_founder" ON public.pod_members;
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

-- Pod Invitations: Pod members can view
DROP POLICY IF EXISTS "pod_invitations_select" ON public.pod_invitations;
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

-- Pod Invitations: Manager can create
DROP POLICY IF EXISTS "pod_invitations_insert_manager" ON public.pod_invitations;
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

-- Pod Invitations: Founder can delete
DROP POLICY IF EXISTS "pod_invitations_delete_founder" ON public.pod_invitations;
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
