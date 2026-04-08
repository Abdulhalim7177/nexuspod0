-- ============================================
-- Migration: 017_fix_task_assignee_relations
-- Purpose: Ensure task_assignees reference profiles for easier joining
-- ============================================

ALTER TABLE public.task_assignees
DROP CONSTRAINT IF EXISTS task_assignees_user_id_fkey,
ADD CONSTRAINT task_assignees_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;

ALTER TABLE public.tasks
DROP CONSTRAINT IF EXISTS tasks_created_by_fkey,
ADD CONSTRAINT tasks_created_by_fkey 
    FOREIGN KEY (created_by) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;

ALTER TABLE public.task_submissions
DROP CONSTRAINT IF EXISTS task_submissions_submitted_by_fkey,
ADD CONSTRAINT task_submissions_submitted_by_fkey 
    FOREIGN KEY (submitted_by) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;

ALTER TABLE public.task_reviews
DROP CONSTRAINT IF EXISTS task_reviews_reviewed_by_fkey,
ADD CONSTRAINT task_reviews_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
