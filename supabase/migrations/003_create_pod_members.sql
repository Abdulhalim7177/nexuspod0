-- ============================================
-- Migration: 003_create_pod_members
-- Purpose: Create pod_members table for multi-tenant
--          access control and role management
-- ============================================

-- 1. Create pod_members table
CREATE TABLE public.pod_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id UUID NOT NULL REFERENCES public.pods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('FOUNDER', 'POD_MANAGER', 'TEAM_LEAD', 'MEMBER')),
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(pod_id, user_id)
);

COMMENT ON TABLE public.pod_members IS 'Links users to pods with roles - enables multi-tenant access control.';

-- 2. Enable Row Level Security
ALTER TABLE public.pod_members ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for pod_members

-- Users can view members of pods they belong to (using SECURITY DEFINER function to avoid recursion)
CREATE OR REPLACE FUNCTION public.can_view_pod_members(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.pod_members pm
    WHERE pm.user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "pod_members_select"
  ON public.pod_members
  FOR SELECT
  TO authenticated
  USING (public.can_view_pod_members(auth.uid()));

-- Founder or Manager can invite/add members
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

CREATE POLICY "pod_members_insert_manager"
  ON public.pod_members
  FOR INSERT
  TO authenticated
  WITH CHECK (public.can_add_pod_member(pod_id, auth.uid()));

-- Founder can update roles
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

CREATE POLICY "pod_members_update_founder"
  ON public.pod_members
  FOR UPDATE
  TO authenticated
  USING (public.can_update_pod_member(pod_id, auth.uid()))
  WITH CHECK (public.can_update_pod_member(pod_id, auth.uid()));

-- Founder can remove members
CREATE POLICY "pod_members_delete_founder"
  ON public.pod_members
  FOR DELETE
  TO authenticated
  USING (public.can_update_pod_member(pod_id, auth.uid()));

-- 4. Function to auto-add founder to pod
CREATE OR REPLACE FUNCTION public.handle_pod_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.pod_members (pod_id, user_id, role)
  VALUES (NEW.id, NEW.founder_id, 'FOUNDER');
  RETURN NEW;
END;
$$;

-- 5. Trigger to auto-join founder when pod is created
CREATE TRIGGER auto_join_founder_on_pod_create
  AFTER INSERT ON public.pods
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_pod_creation();

-- 6. Update pods RLS to use membership check
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

-- Update UPDATE policy
DROP POLICY IF EXISTS "pods_update_member" ON public.pods;
DROP POLICY IF EXISTS "pods_delete_member" ON public.pods;

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

-- 7. Indexes for performance
CREATE INDEX idx_pod_members_pod ON public.pod_members(pod_id);
CREATE INDEX idx_pod_members_user ON public.pod_members(user_id);
CREATE INDEX idx_pod_members_role ON public.pod_members(role);
