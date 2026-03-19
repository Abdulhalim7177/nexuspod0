-- ============================================
-- Migration: 007_reset_pods_policies
-- Purpose: Reset all pods policies to ensure insert works
-- ============================================

-- Drop all existing policies on pods
DROP POLICY IF EXISTS "pods_insert_authenticated" ON public.pods;
DROP POLICY IF EXISTS "pods_select_member" ON public.pods;
DROP POLICY IF EXISTS "pods_update_member" ON public.pods;
DROP POLICY IF EXISTS "pods_delete_member" ON public.pods;
DROP POLICY IF EXISTS "pods_update_founder" ON public.pods;
DROP POLICY IF EXISTS "pods_delete_founder" ON public.pods;

-- Create simple INSERT policy - any authenticated user can create a pod (with themselves as founder)
CREATE POLICY "pods_insert_authenticated"
  ON public.pods
  FOR INSERT
  TO authenticated
  WITH CHECK (founder_id = auth.uid());

-- SELECT: Users can view pods they belong to via pod_members
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

-- UPDATE: Founder only
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

-- DELETE: Founder only
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
