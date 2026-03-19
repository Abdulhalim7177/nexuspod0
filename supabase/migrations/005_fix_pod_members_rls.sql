-- ============================================
-- Migration: 005_fix_pod_members_rls
-- Purpose: Fix infinite recursion in pod_members RLS policies
-- ============================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "pod_members_select" ON public.pod_members;
DROP POLICY IF EXISTS "pod_members_insert_manager" ON public.pod_members;
DROP POLICY IF EXISTS "pod_members_update_founder" ON public.pod_members;
DROP POLICY IF EXISTS "pod_members_delete_founder" ON public.pod_members;

-- Create helper functions to avoid recursion

-- Function to check if user can view pod members
CREATE OR REPLACE FUNCTION public.can_view_pod_members(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.pod_members pm
    WHERE pm.user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can add pod member
CREATE OR REPLACE FUNCTION public.can_add_pod_member(p_pod_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.pod_members pm
    WHERE pm.pod_id = p_pod_id
    AND pm.user_id = p_user_id
    AND pm.role IN ('FOUNDER', 'POD_MANAGER')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can update pod member (founder only)
CREATE OR REPLACE FUNCTION public.can_update_pod_member(p_pod_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.pod_members pm
    WHERE pm.pod_id = p_pod_id
    AND pm.user_id = p_user_id
    AND pm.role = 'FOUNDER'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies using helper functions

CREATE POLICY "pod_members_select"
  ON public.pod_members
  FOR SELECT
  TO authenticated
  USING (public.can_view_pod_members(auth.uid()));

CREATE POLICY "pod_members_insert_manager"
  ON public.pod_members
  FOR INSERT
  TO authenticated
  WITH CHECK (public.can_add_pod_member(pod_id, auth.uid()));

CREATE POLICY "pod_members_update_founder"
  ON public.pod_members
  FOR UPDATE
  TO authenticated
  USING (public.can_update_pod_member(pod_id, auth.uid()))
  WITH CHECK (public.can_update_pod_member(pod_id, auth.uid()));

CREATE POLICY "pod_members_delete_founder"
  ON public.pod_members
  FOR DELETE
  TO authenticated
  USING (public.can_update_pod_member(pod_id, auth.uid()));
