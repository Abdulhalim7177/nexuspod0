-- ============================================
-- Migration: 015_auto_member_and_strict_access
-- Purpose: Auto-add creator to project_members and restrict access
-- ============================================

-- 1. Trigger to auto-add creator to project_members
CREATE OR REPLACE FUNCTION public.handle_project_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.project_members (project_id, user_id)
    VALUES (NEW.id, NEW.created_by)
    ON CONFLICT (project_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS auto_add_creator_to_project ON public.projects;
CREATE TRIGGER auto_add_creator_to_project
    AFTER INSERT ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_project_creation();

-- 2. Backfill existing projects: Add creators to project_members if missing
-- NOTE: We temporarily disable the audit trigger to avoid null auth.uid() error
ALTER TABLE public.project_members DISABLE TRIGGER audit_project_members_change;

INSERT INTO public.project_members (project_id, user_id)
SELECT id, created_by FROM public.projects
ON CONFLICT (project_id, user_id) DO NOTHING;

ALTER TABLE public.project_members ENABLE TRIGGER audit_project_members_change;

-- 3. Update RLS: Only project members and pod admins can see the project
DROP POLICY IF EXISTS "projects_select" ON public.projects;
CREATE POLICY "projects_select"
    ON public.projects FOR SELECT TO authenticated
    USING (
        public.is_project_member(id, auth.uid())
        OR
        EXISTS (
            SELECT 1 FROM public.pod_members 
            WHERE pod_id = projects.pod_id 
            AND user_id = auth.uid() 
            AND role IN ('FOUNDER', 'POD_MANAGER')
        )
    );

-- 4. Ensure project_members SELECT matches
DROP POLICY IF EXISTS "project_members_select" ON public.project_members;
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
