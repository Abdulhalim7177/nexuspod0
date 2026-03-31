-- ============================================
-- Migration: 011_allow_project_creators
-- Purpose: Allow project creators to manage their projects and tasks
-- ============================================

-- 1. Update Projects policies to include creator
DROP POLICY IF EXISTS "projects_update" ON public.projects;
CREATE POLICY "projects_update"
    ON public.projects FOR UPDATE TO authenticated
    USING (
        created_by = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.pod_members 
            WHERE pod_id = projects.pod_id 
            AND user_id = auth.uid() 
            AND role IN ('FOUNDER', 'POD_MANAGER')
        )
    );

DROP POLICY IF EXISTS "projects_delete" ON public.projects;
CREATE POLICY "projects_delete"
    ON public.projects FOR DELETE TO authenticated
    USING (
        created_by = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.pod_members 
            WHERE pod_id = projects.pod_id 
            AND user_id = auth.uid() 
            AND role IN ('FOUNDER', 'POD_MANAGER')
        )
    );

-- 2. Update Tasks policies to include project creator
DROP POLICY IF EXISTS "tasks_insert" ON public.tasks;
CREATE POLICY "tasks_insert"
    ON public.tasks FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = tasks.project_id
            AND (
                p.created_by = auth.uid() -- Project creator
                OR 
                public.is_pod_member(p.pod_id, auth.uid()) -- Any pod member can technically insert if UI allows, but we restrict management
            )
        )
    );

DROP POLICY IF EXISTS "tasks_update" ON public.tasks;
CREATE POLICY "tasks_update"
    ON public.tasks FOR UPDATE TO authenticated
    USING (
        created_by = auth.uid() -- Task creator
        OR
        EXISTS (SELECT 1 FROM public.task_assignees WHERE task_id = id AND user_id = auth.uid()) -- Assignee
        OR
        EXISTS (SELECT 1 FROM public.pod_members WHERE pod_id = tasks.pod_id AND user_id = auth.uid() AND role IN ('FOUNDER', 'POD_MANAGER')) -- Pod Admin
        OR
        EXISTS (SELECT 1 FROM public.projects WHERE id = tasks.project_id AND created_by = auth.uid()) -- Project Creator
    );

-- 3. Update Project Members policies
DROP POLICY IF EXISTS "project_members_modify" ON public.project_members;
CREATE POLICY "project_members_modify"
    ON public.project_members FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_members.project_id
            AND p.created_by = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.pod_members pm
            JOIN public.projects p ON p.pod_id = pm.pod_id
            WHERE p.id = project_members.project_id
            AND pm.user_id = auth.uid()
            AND pm.role IN ('FOUNDER', 'POD_MANAGER')
        )
    );
