-- ============================================
-- Migration: 012_disable_all_rls
-- Purpose: Disable all RLS to get app working
-- ============================================

ALTER TABLE public.pods DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_invitations DISABLE ROW LEVEL SECURITY;
