-- ============================================
-- Migration: 009_create_audit_logs
-- Purpose: Track system-wide changes and user actions
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pod_id UUID NOT NULL REFERENCES public.pods(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    action TEXT NOT NULL, -- e.g., 'TASK_CREATED', 'TASK_APPROVED', 'PROJECT_UPDATED'
    entity_type TEXT NOT NULL, -- e.g., 'TASK', 'PROJECT', 'POD'
    entity_id UUID NOT NULL,
    old_values JSONB DEFAULT '{}'::jsonb,
    new_values JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- SELECT: Pod members can see logs for their pod
CREATE POLICY "audit_logs_select"
    ON public.audit_logs FOR SELECT TO authenticated
    USING (public.is_pod_member(pod_id, auth.uid()));

-- Function to log events easily
CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_pod_id UUID,
    p_project_id UUID,
    p_user_id UUID,
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID,
    p_old_values JSONB DEFAULT '{}'::jsonb,
    p_new_values JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.audit_logs (
        pod_id, project_id, user_id, action, entity_type, entity_id, old_values, new_values
    ) VALUES (
        p_pod_id, p_project_id, p_user_id, p_action, p_entity_type, p_entity_id, p_old_values, p_new_values
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT ALL ON public.audit_logs TO authenticated;
