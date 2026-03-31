-- ============================================
-- Migration: 007_create_tasks
-- Purpose: Create task-related tables with RLS and lifecycle support
-- ============================================

-- 1. Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    pod_id UUID NOT NULL REFERENCES public.pods(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'ONGOING', 'DONE', 'APPROVED')),
    priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    due_date TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    momentum_value INT DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create task_assignees table
CREATE TABLE IF NOT EXISTS public.task_assignees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(task_id, user_id)
);

-- 3. Create task_comments table
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    file_urls TEXT[] DEFAULT '{}',
    link_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create task_submissions table
CREATE TABLE IF NOT EXISTS public.task_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES public.profiles(id),
    description TEXT,
    file_urls TEXT[] DEFAULT '{}',
    link_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create task_reviews table
CREATE TABLE IF NOT EXISTS public.task_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES public.task_submissions(id),
    reviewed_by UUID NOT NULL REFERENCES public.profiles(id),
    action TEXT NOT NULL CHECK (action IN ('APPROVED', 'CORRECTED')),
    feedback TEXT,
    file_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_reviews ENABLE ROW LEVEL SECURITY;

-- 7. Task Policies

-- SELECT: Pod members with project access can see tasks
CREATE POLICY "tasks_select"
    ON public.tasks FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = tasks.project_id
            AND (
                p.is_private = false AND public.is_pod_member(p.pod_id, auth.uid())
                OR
                p.is_private = true AND (
                    EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid())
                    OR
                    EXISTS (SELECT 1 FROM public.pod_members pm WHERE pm.pod_id = p.pod_id AND pm.user_id = auth.uid() AND pm.role IN ('FOUNDER', 'POD_MANAGER'))
                )
            )
        )
    );

-- INSERT: Project members or pod founders/managers can create tasks
CREATE POLICY "tasks_insert"
    ON public.tasks FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = tasks.project_id
            AND (
                public.is_pod_member(p.pod_id, auth.uid())
            )
        )
    );

-- UPDATE: Creator, Assignee, or Pod Founders/Managers
CREATE POLICY "tasks_update"
    ON public.tasks FOR UPDATE TO authenticated
    USING (
        created_by = auth.uid()
        OR
        EXISTS (SELECT 1 FROM public.task_assignees WHERE task_id = id AND user_id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM public.pod_members WHERE pod_id = tasks.pod_id AND user_id = auth.uid() AND role IN ('FOUNDER', 'POD_MANAGER'))
    );

-- DELETE: Creator or Pod Founders/Managers
CREATE POLICY "tasks_delete"
    ON public.tasks FOR DELETE TO authenticated
    USING (
        created_by = auth.uid()
        OR
        EXISTS (SELECT 1 FROM public.pod_members WHERE pod_id = tasks.pod_id AND user_id = auth.uid() AND role IN ('FOUNDER', 'POD_MANAGER'))
    );

-- 8. Assignee Policies
CREATE POLICY "task_assignees_all"
    ON public.task_assignees FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND (t.created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.pod_members WHERE pod_id = t.pod_id AND user_id = auth.uid() AND role IN ('FOUNDER', 'POD_MANAGER'))))
        OR
        user_id = auth.uid()
    );

-- 9. Comment Policies
CREATE POLICY "task_comments_select"
    ON public.task_comments FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id));

CREATE POLICY "task_comments_insert"
    ON public.task_comments FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- 10. Submission Policies
CREATE POLICY "task_submissions_all"
    ON public.task_submissions FOR ALL TO authenticated
    USING (
        submitted_by = auth.uid()
        OR
        EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND (t.created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.pod_members WHERE pod_id = t.pod_id AND user_id = auth.uid() AND role IN ('FOUNDER', 'POD_MANAGER'))))
    );

-- 11. Updated at trigger
CREATE TRIGGER on_task_updated
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 12. Grant access
GRANT ALL ON public.tasks TO authenticated;
GRANT ALL ON public.task_assignees TO authenticated;
GRANT ALL ON public.task_comments TO authenticated;
GRANT ALL ON public.task_submissions TO authenticated;
GRANT ALL ON public.task_reviews TO authenticated;
