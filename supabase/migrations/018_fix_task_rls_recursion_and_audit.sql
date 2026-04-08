-- ============================================
-- Migration: 018_fix_task_rls_recursion_and_audit
-- Purpose: Fix infinite recursion in tasks RLS via SECURITY DEFINER function,
--          add tasks_delete policy, expand audit trigger for all CRUD ops
-- ============================================

-- 1. Create SECURITY DEFINER function to check task assignee without triggering RLS
--    This breaks the circular dependency: tasks_update -> task_assignees -> tasks
CREATE OR REPLACE FUNCTION public.is_task_assignee(p_task_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.task_assignees
    WHERE task_id = p_task_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Recreate tasks_update using the SECURITY DEFINER function
DROP POLICY IF EXISTS "tasks_update" ON public.tasks;
CREATE POLICY "tasks_update"
    ON public.tasks FOR UPDATE TO authenticated
    USING (
        created_by = auth.uid()
        OR
        public.is_task_assignee(id, auth.uid())
        OR
        EXISTS (
            SELECT 1 FROM public.pod_members
            WHERE pod_id = tasks.pod_id
            AND user_id = auth.uid()
            AND role IN ('FOUNDER', 'POD_MANAGER')
        )
        OR
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = tasks.project_id AND created_by = auth.uid()
        )
    )
    WITH CHECK (
        created_by = auth.uid()
        OR
        public.is_task_assignee(id, auth.uid())
        OR
        EXISTS (
            SELECT 1 FROM public.pod_members
            WHERE pod_id = tasks.pod_id
            AND user_id = auth.uid()
            AND role IN ('FOUNDER', 'POD_MANAGER')
        )
        OR
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = tasks.project_id AND created_by = auth.uid()
        )
    );

-- 3. Add tasks_delete policy (task creator, project creator, or pod admin)
DROP POLICY IF EXISTS "tasks_delete" ON public.tasks;
CREATE POLICY "tasks_delete"
    ON public.tasks FOR DELETE TO authenticated
    USING (
        created_by = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.pod_members
            WHERE pod_id = tasks.pod_id
            AND user_id = auth.uid()
            AND role IN ('FOUNDER', 'POD_MANAGER')
        )
        OR
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = tasks.project_id AND created_by = auth.uid()
        )
    );

-- 4. Expand audit trigger: handle INSERT, UPDATE (status change + other fields), DELETE
CREATE OR REPLACE FUNCTION public.trig_audit_tasks()
RETURNS TRIGGER AS $$
BEGIN
    IF (auth.uid() IS NULL) THEN
        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        END IF;
        RETURN NEW;
    END IF;

    IF (TG_OP = 'INSERT') THEN
        PERFORM public.log_audit_event(
            NEW.pod_id, NEW.project_id, auth.uid(), 'TASK_CREATED', 'TASK', NEW.id,
            '{}'::jsonb, jsonb_build_object('title', NEW.title, 'priority', NEW.priority)
        );
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.status <> NEW.status) THEN
            PERFORM public.log_audit_event(
                NEW.pod_id, NEW.project_id, auth.uid(),
                CASE WHEN NEW.status = 'APPROVED' THEN 'TASK_APPROVED' ELSE 'TASK_STATUS_CHANGED' END,
                'TASK', NEW.id,
                jsonb_build_object('status', OLD.status, 'title', OLD.title),
                jsonb_build_object('status', NEW.status, 'title', NEW.title)
            );
        ELSE
            PERFORM public.log_audit_event(
                NEW.pod_id, NEW.project_id, auth.uid(),
                'TASK_UPDATED', 'TASK', NEW.id,
                jsonb_build_object('title', OLD.title, 'priority', OLD.priority, 'due_date', OLD.due_date),
                jsonb_build_object('title', NEW.title, 'priority', NEW.priority, 'due_date', NEW.due_date)
            );
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        PERFORM public.log_audit_event(
            OLD.pod_id, OLD.project_id, auth.uid(), 'TASK_DELETED', 'TASK', OLD.id,
            jsonb_build_object('title', OLD.title, 'priority', OLD.priority),
            '{}'::jsonb
        );
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_tasks_change ON public.tasks;
CREATE TRIGGER audit_tasks_change
    AFTER INSERT OR UPDATE OR DELETE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.trig_audit_tasks();
