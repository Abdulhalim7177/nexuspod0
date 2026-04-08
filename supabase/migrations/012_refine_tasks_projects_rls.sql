-- ============================================
-- Migration: 012_refine_tasks_projects_rls
-- Purpose: Refine permissions, expand task properties, and fix audit logs
-- ============================================

-- 1. Expand tasks table with new properties
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sub_tasks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS dependencies UUID[] DEFAULT '{}';

-- 2. Refine Project Member Permissions: Allow TEAM_LEAD to manage project members
DROP POLICY IF EXISTS "project_members_modify" ON public.project_members;
CREATE POLICY "project_members_modify"
    ON public.project_members FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.pod_members pm
            JOIN public.projects p ON p.pod_id = pm.pod_id
            WHERE p.id = project_members.project_id
            AND pm.user_id = auth.uid()
            AND pm.role IN ('FOUNDER', 'POD_MANAGER', 'TEAM_LEAD')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pod_members pm
            JOIN public.projects p ON p.pod_id = pm.pod_id
            WHERE p.id = project_members.project_id
            AND pm.user_id = auth.uid()
            AND pm.role IN ('FOUNDER', 'POD_MANAGER', 'TEAM_LEAD')
        )
    );

-- 3. Refine Task Permissions: Allow TEAM_LEAD to insert/update any task in their pod's projects
DROP POLICY IF EXISTS "tasks_insert" ON public.tasks;
CREATE POLICY "tasks_insert"
    ON public.tasks FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pod_members 
            WHERE pod_id = tasks.pod_id 
            AND user_id = auth.uid() 
            AND role IN ('FOUNDER', 'POD_MANAGER', 'TEAM_LEAD', 'MEMBER')
        )
    );

DROP POLICY IF EXISTS "tasks_update" ON public.tasks;
CREATE POLICY "tasks_update"
    ON public.tasks FOR UPDATE TO authenticated
    USING (
        created_by = auth.uid()
        OR
        EXISTS (SELECT 1 FROM public.task_assignees WHERE task_id = id AND user_id = auth.uid())
        OR
        EXISTS (
            SELECT 1 FROM public.pod_members 
            WHERE pod_id = tasks.pod_id 
            AND user_id = auth.uid() 
            AND role IN ('FOUNDER', 'POD_MANAGER', 'TEAM_LEAD')
        )
    )
    WITH CHECK (
        created_by = auth.uid()
        OR
        EXISTS (SELECT 1 FROM public.task_assignees WHERE task_id = id AND user_id = auth.uid())
        OR
        EXISTS (
            SELECT 1 FROM public.pod_members 
            WHERE pod_id = tasks.pod_id 
            AND user_id = auth.uid() 
            AND role IN ('FOUNDER', 'POD_MANAGER', 'TEAM_LEAD')
        )
    );

-- 4. Refine Task Assignee Permissions
DROP POLICY IF EXISTS "task_assignees_all" ON public.task_assignees;
CREATE POLICY "task_assignees_all"
    ON public.task_assignees FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tasks t 
            WHERE t.id = task_id 
            AND (
                t.created_by = auth.uid() 
                OR 
                EXISTS (
                    SELECT 1 FROM public.pod_members 
                    WHERE pod_id = t.pod_id 
                    AND user_id = auth.uid() 
                    AND role IN ('FOUNDER', 'POD_MANAGER', 'TEAM_LEAD')
                )
            )
        )
        OR
        user_id = auth.uid()
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tasks t 
            WHERE t.id = task_id 
            AND (
                t.created_by = auth.uid() 
                OR 
                EXISTS (
                    SELECT 1 FROM public.pod_members 
                    WHERE pod_id = t.pod_id 
                    AND user_id = auth.uid() 
                    AND role IN ('FOUNDER', 'POD_MANAGER', 'TEAM_LEAD')
                )
            )
        )
        OR
        user_id = auth.uid()
    );

-- 5. Fix Audit Logs RLS: Allow triggers (SECURITY DEFINER) to insert even if user doesn't have direct INSERT permission
-- But we should also allow manual logging if needed
DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;
CREATE POLICY "audit_logs_insert"
    ON public.audit_logs FOR INSERT TO authenticated
    WITH CHECK (true); -- Triggers use SECURITY DEFINER anyway

-- 6. Add Audit Log index for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_project ON public.audit_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- 7. Grant access to profiles (needed for history display joining)
GRANT SELECT ON public.profiles TO authenticated;
