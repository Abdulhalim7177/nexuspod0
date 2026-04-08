-- ============================================
-- Migration: 008_fix_recursion
-- Purpose: Resolve infinite recursion in project_members RLS
-- ============================================

-- 1. Create helper function for project membership check to avoid recursion in policies
CREATE OR REPLACE FUNCTION public.is_project_member(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = p_project_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing problematic policies
DROP POLICY IF EXISTS "project_members_select" ON public.project_members;
DROP POLICY IF EXISTS "project_members_modify" ON public.project_members;

-- 3. New SELECT policy: Any pod member can see project memberships 
-- (This avoids recursion by not checking project_members table for the "OR" condition)
CREATE POLICY "project_members_select"
    ON public.project_members FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.pod_members pm
            JOIN public.projects p ON p.pod_id = pm.pod_id
            WHERE p.id = project_members.project_id
            AND pm.user_id = auth.uid()
        )
    );

-- 4. New MODIFY policy (INSERT/UPDATE/DELETE): Pod Founders and Managers only
CREATE POLICY "project_members_modify"
    ON public.project_members FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.pod_members pm
            JOIN public.projects p ON p.pod_id = pm.pod_id
            WHERE p.id = project_members.project_id
            AND pm.user_id = auth.uid()
            AND pm.role IN ('FOUNDER', 'POD_MANAGER')
        )
    );

-- 5. Fix projects_select policy to use helper function and avoid potential issues
DROP POLICY IF EXISTS "projects_select" ON public.projects;
CREATE POLICY "projects_select"
    ON public.projects FOR SELECT TO authenticated
    USING (
        (is_private = false AND public.is_pod_member(pod_id, auth.uid()))
        OR
        (is_private = true AND (
            public.is_project_member(id, auth.uid())
            OR
            EXISTS (
                SELECT 1 FROM public.pod_members 
                WHERE pod_id = projects.pod_id 
                AND user_id = auth.uid() 
                AND role IN ('FOUNDER', 'POD_MANAGER')
            )
        ))
    );
