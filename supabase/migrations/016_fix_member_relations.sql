-- ============================================
-- Migration: 016_fix_member_relations
-- Purpose: Ensure pod_members and project_members reference profiles
--          consistently for easier joining and display.
-- ============================================

-- 1. Update pod_members to reference profiles explicitly
-- (Note: They both use the same UUID from auth.users)
ALTER TABLE public.pod_members
DROP CONSTRAINT IF EXISTS pod_members_user_id_fkey,
ADD CONSTRAINT pod_members_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;

-- 2. Ensure project_members references profiles (already does, but being safe)
ALTER TABLE public.project_members
DROP CONSTRAINT IF EXISTS project_members_user_id_fkey,
ADD CONSTRAINT project_members_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;

-- 3. Update audit_logs to reference profiles
ALTER TABLE public.audit_logs
DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey,
ADD CONSTRAINT audit_logs_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;

-- 4. Re-grant select on profiles just in case
GRANT SELECT ON public.profiles TO authenticated;
