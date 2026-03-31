-- ============================================
-- Migration: 014_create_project_requests
-- Purpose: Handle project join requests for pod members
-- ============================================

CREATE TABLE IF NOT EXISTS public.project_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    pod_id UUID NOT NULL REFERENCES public.pods(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, user_id)
);

ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;

-- SELECT: Project admins and the requester can see the request
CREATE POLICY "project_requests_select"
    ON public.project_requests FOR SELECT TO authenticated
    USING (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.pod_members 
            WHERE pod_id = project_requests.pod_id 
            AND user_id = auth.uid() 
            AND role IN ('FOUNDER', 'POD_MANAGER', 'TEAM_LEAD')
        )
    );

-- INSERT: Any pod member can request to join
CREATE POLICY "project_requests_insert"
    ON public.project_requests FOR INSERT TO authenticated
    WITH CHECK (
        public.is_pod_member(pod_id, auth.uid())
        AND
        user_id = auth.uid()
    );

-- UPDATE/DELETE: Project admins
CREATE POLICY "project_requests_manage"
    ON public.project_requests FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.pod_members 
            WHERE pod_id = project_requests.pod_id 
            AND user_id = auth.uid() 
            AND role IN ('FOUNDER', 'POD_MANAGER', 'TEAM_LEAD')
        )
    );

-- Trigger for updated_at
CREATE TRIGGER on_project_request_updated
    BEFORE UPDATE ON public.project_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant access
GRANT ALL ON public.project_requests TO authenticated;
