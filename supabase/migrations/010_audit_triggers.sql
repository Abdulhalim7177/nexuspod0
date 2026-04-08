-- ============================================
-- Migration: 010_audit_triggers
-- Purpose: Automate audit logging for projects and tasks
-- ============================================

-- 1. Project Triggers
CREATE OR REPLACE FUNCTION public.trig_audit_projects()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if there is an authenticated user
    IF (auth.uid() IS NULL) THEN
        RETURN NEW;
    END IF;

    IF (TG_OP = 'UPDATE') THEN
        PERFORM public.log_audit_event(
            NEW.pod_id, NEW.id, auth.uid(), 'PROJECT_UPDATED', 'PROJECT', NEW.id,
            jsonb_build_object('title', OLD.title, 'is_private', OLD.is_private),
            jsonb_build_object('title', NEW.title, 'is_private', NEW.is_private)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_projects_update ON public.projects;
CREATE TRIGGER audit_projects_update
    AFTER UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.trig_audit_projects();

-- 2. Project Member Triggers
CREATE OR REPLACE FUNCTION public.trig_audit_project_members()
RETURNS TRIGGER AS $$
DECLARE
    v_pod_id UUID;
BEGIN
    -- Only log if there is an authenticated user
    IF (auth.uid() IS NULL) THEN
        RETURN NEW;
    END IF;

    SELECT pod_id INTO v_pod_id FROM public.projects WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    
    IF (TG_OP = 'INSERT') THEN
        PERFORM public.log_audit_event(
            v_pod_id, NEW.project_id, auth.uid(), 'MEMBER_ADDED', 'PROJECT', NEW.project_id,
            '{}'::jsonb, jsonb_build_object('user_id', NEW.user_id)
        );
    ELSIF (TG_OP = 'DELETE') THEN
        PERFORM public.log_audit_event(
            v_pod_id, OLD.project_id, auth.uid(), 'MEMBER_REMOVED', 'PROJECT', OLD.project_id,
            jsonb_build_object('user_id', OLD.user_id), '{}'::jsonb
        );
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_project_members_change ON public.project_members;
CREATE TRIGGER audit_project_members_change
    AFTER INSERT OR DELETE ON public.project_members
    FOR EACH ROW EXECUTE FUNCTION public.trig_audit_project_members();

-- 3. Task Triggers
CREATE OR REPLACE FUNCTION public.trig_audit_tasks()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if there is an authenticated user
    IF (auth.uid() IS NULL) THEN
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
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_tasks_change ON public.tasks;
CREATE TRIGGER audit_tasks_change
    AFTER INSERT OR UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.trig_audit_tasks();
