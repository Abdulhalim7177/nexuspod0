-- ============================================
-- Migration: 003_create_pod_members
-- Purpose: Create pod_members + auto-join founder + RLS
-- ============================================

CREATE TABLE public.pod_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id UUID NOT NULL REFERENCES public.pods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('FOUNDER', 'POD_MANAGER', 'TEAM_LEAD', 'MEMBER')),
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(pod_id, user_id)
);

ALTER TABLE public.pod_members ENABLE ROW LEVEL SECURITY;

-- Helper functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.can_view_pod_members(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.pod_members WHERE user_id = p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_manage_pod_member(p_pod_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.pod_members
    WHERE pod_id = p_pod_id AND user_id = p_user_id AND role IN ('FOUNDER', 'POD_MANAGER')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_pod_founder(p_pod_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.pod_members
    WHERE pod_id = p_pod_id AND user_id = p_user_id AND role = 'FOUNDER'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pods RLS: SELECT - only members
CREATE POLICY "pods_select_member"
  ON public.pods FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pod_members WHERE pod_id = pods.id AND user_id = auth.uid()));

-- Pods RLS: INSERT - authenticated users
CREATE POLICY "pods_insert"
  ON public.pods FOR INSERT TO authenticated
  WITH CHECK (founder_id = auth.uid());

-- Pods RLS: UPDATE - founder only
CREATE POLICY "pods_update"
  ON public.pods FOR UPDATE TO authenticated
  USING (public.is_pod_founder(id, auth.uid()))
  WITH CHECK (public.is_pod_founder(id, auth.uid()));

-- Pods RLS: DELETE - founder only
CREATE POLICY "pods_delete"
  ON public.pods FOR DELETE TO authenticated
  USING (public.is_pod_founder(id, auth.uid()));

-- Pod Members RLS: SELECT - pod members
CREATE POLICY "pod_members_select"
  ON public.pod_members FOR SELECT TO authenticated
  USING (public.can_view_pod_members(auth.uid()));

-- Pod Members RLS: INSERT - managers
CREATE POLICY "pod_members_insert"
  ON public.pod_members FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_pod_member(pod_id, auth.uid()));

-- Pod Members RLS: UPDATE - founder only
CREATE POLICY "pod_members_update"
  ON public.pod_members FOR UPDATE TO authenticated
  USING (public.is_pod_founder(pod_id, auth.uid()))
  WITH CHECK (public.is_pod_founder(pod_id, auth.uid()));

-- Pod Members RLS: DELETE - founder only
CREATE POLICY "pod_members_delete"
  ON public.pod_members FOR DELETE TO authenticated
  USING (public.is_pod_founder(pod_id, auth.uid()));

-- Auto-join founder when pod is created
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

CREATE TRIGGER auto_join_founder_on_pod_create
  AFTER INSERT ON public.pods
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_pod_creation();

CREATE INDEX idx_pod_members_pod ON public.pod_members(pod_id);
CREATE INDEX idx_pod_members_user ON public.pod_members(user_id);
CREATE INDEX idx_pod_members_role ON public.pod_members(role);
