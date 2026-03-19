-- ============================================
-- Migration: 006_fix_pods_insert_policy
-- Purpose: Fix pods INSERT policy to allow users to create pods
-- ============================================

-- Check and create the INSERT policy if it doesn't exist
DROP POLICY IF EXISTS "pods_insert_authenticated" ON public.pods;

CREATE POLICY "pods_insert_authenticated"
  ON public.pods
  FOR INSERT
  TO authenticated
  WITH CHECK (founder_id = auth.uid());

-- Verify other pods policies exist
DROP POLICY IF EXISTS "pods_select_member" ON public.pods;
DROP POLICY IF EXISTS "pods_update_member" ON public.pods;
DROP POLICY IF EXISTS "pods_delete_member" ON public.pods;

-- SELECT: Users can view pods they belong to
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

-- UPDATE: Only founder can update
CREATE POLICY "pods_update_member"
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

-- DELETE: Only founder can delete
CREATE POLICY "pods_delete_member"
  ON public.pods
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pod_members pm
      WHERE pm.pod_id = pods.id
      AND pm.user_id = auth.uid()
      AND pm.role = 'FOUNDER'
    )
  );
