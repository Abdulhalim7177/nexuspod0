-- ============================================
-- Migration: 011_fix_trigger_no_rls
-- Purpose: Fix trigger to bypass RLS during pod creation
-- ============================================

-- Disable RLS
ALTER TABLE public.pods DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_invitations DISABLE ROW LEVEL SECURITY;

-- Recreate trigger function with SETTINGS to bypass RLS
CREATE OR REPLACE FUNCTION public.handle_pod_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Disable RLS for this operation
  SET LOCAL row_security = off;
  
  INSERT INTO public.pod_members (pod_id, user_id, role)
  VALUES (NEW.id, NEW.founder_id, 'FOUNDER');
  
  RETURN NEW;
END;
$$;
