-- ============================================
-- Migration: 008_simple_insert_policy
-- Purpose: Simplify pods INSERT policy
-- ============================================

-- Drop existing insert policy
DROP POLICY IF EXISTS "pods_insert_authenticated" ON public.pods;

-- Create permissive insert policy - any authenticated user can create pods
-- The founder_id validation happens in the app/trigger
CREATE POLICY "pods_insert_any_authenticated"
  ON public.pods
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
