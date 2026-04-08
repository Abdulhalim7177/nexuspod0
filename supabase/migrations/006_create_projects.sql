-- ============================================
-- Migration: 006_create_projects
-- Purpose: Create projects and project_members tables with RLS
-- ============================================

-- 1. Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pod_id UUID NOT NULL REFERENCES public.pods(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create project_members table (for private projects)
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, user_id)
);

-- 3. Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- 4. Projects Policies

-- SELECT: Pod members can see public projects. Private projects only for members/founders/managers.
CREATE POLICY "projects_select"
    ON public.projects FOR SELECT TO authenticated
    USING (
        (is_private = false AND public.is_pod_member(pod_id, auth.uid()))
        OR
        (is_private = true AND (
            EXISTS (SELECT 1 FROM public.project_members WHERE project_id = projects.id AND user_id = auth.uid())
            OR
            EXISTS (
                SELECT 1 FROM public.pod_members 
                WHERE pod_id = projects.pod_id 
                AND user_id = auth.uid() 
                AND role IN ('FOUNDER', 'POD_MANAGER')
            )
        ))
    );

-- INSERT: Founder, Pod Manager, and Team Lead can create projects
CREATE POLICY "projects_insert"
    ON public.projects FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pod_members 
            WHERE pod_id = projects.pod_id 
            AND user_id = auth.uid() 
            AND role IN ('FOUNDER', 'POD_MANAGER', 'TEAM_LEAD')
        )
    );

-- UPDATE: Founder and Pod Manager only
CREATE POLICY "projects_update"
    ON public.projects FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.pod_members 
            WHERE pod_id = projects.pod_id 
            AND user_id = auth.uid() 
            AND role IN ('FOUNDER', 'POD_MANAGER')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pod_members 
            WHERE pod_id = projects.pod_id 
            AND user_id = auth.uid() 
            AND role IN ('FOUNDER', 'POD_MANAGER')
        )
    );

-- DELETE: Founder and Pod Manager only
CREATE POLICY "projects_delete"
    ON public.projects FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.pod_members 
            WHERE pod_id = projects.pod_id 
            AND user_id = auth.uid() 
            AND role IN ('FOUNDER', 'POD_MANAGER')
        )
    );

-- 5. Project Members Policies

-- SELECT: Project members and Pod Founders/Managers can see membership
CREATE POLICY "project_members_select"
    ON public.project_members FOR SELECT TO authenticated
    USING (
        user_id = auth.uid()
        OR
        EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = project_members.project_id AND pm.user_id = auth.uid())
        OR
        EXISTS (
            SELECT 1 FROM public.pod_members pm
            JOIN public.projects p ON p.pod_id = pm.pod_id
            WHERE p.id = project_members.project_id
            AND pm.user_id = auth.uid()
            AND pm.role IN ('FOUNDER', 'POD_MANAGER')
        )
    );

-- INSERT/UPDATE/DELETE: Founder and Pod Manager only
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

-- 6. Updated at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_project_updated
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. Grant access
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.project_members TO authenticated;
