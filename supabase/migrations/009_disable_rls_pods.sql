-- ============================================
-- Migration: 009_disable_rls_temporarily
-- Purpose: Disable RLS on pods to get creation working
-- ============================================

-- Disable RLS on pods table
ALTER TABLE public.pods DISABLE ROW LEVEL SECURITY;

-- Also disable on pod_members temporarily
ALTER TABLE public.pod_members DISABLE ROW LEVEL SECURITY;

-- Also disable on pod_invitations temporarily
ALTER TABLE public.pod_invitations DISABLE ROW LEVEL SECURITY;
