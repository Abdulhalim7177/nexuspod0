-- ============================================
-- Migration: 005_fix_pods_rls
-- Purpose: Fix Pod creation RLS and allow multiple pods per user
-- ============================================

-- 1. Create helper function for membership check
CREATE OR REPLACE FUNCTION public.is_pod_member(p_pod_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.pod_members
    WHERE pod_id = p_pod_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Make NPN generation SECURITY DEFINER to avoid RLS issues when checking uniqueness
CREATE OR REPLACE FUNCTION public.generate_npn()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  random_suffix TEXT;
  npn_text TEXT;
  exists_check BOOLEAN;
BEGIN
  random_suffix := upper(substring(md5(random()::text) from 1 for 5));
  npn_text := 'NP-' || random_suffix;
  SELECT EXISTS(SELECT 1 FROM public.pods WHERE npn = npn_text) INTO exists_check;
  WHILE exists_check LOOP
    random_suffix := upper(substring(md5(random()::text) from 1 for 5));
    npn_text := 'NP-' || random_suffix;
    SELECT EXISTS(SELECT 1 FROM public.pods WHERE npn = npn_text) INTO exists_check;
  END LOOP;
  NEW.npn := npn_text;
  RETURN NEW;
END;
$$;

-- 3. Drop existing policies to start fresh
DROP POLICY IF EXISTS "pods_select_member" ON public.pods;
DROP POLICY IF EXISTS "pods_insert" ON public.pods;
DROP POLICY IF EXISTS "pods_update" ON public.pods;
DROP POLICY IF EXISTS "pods_delete" ON public.pods;

-- 4. SELECT policy: Allow if user is founder OR a member
-- Explicitly allowing founder_id check avoids dependency on pod_members during initial creation
CREATE POLICY "pods_select"
  ON public.pods FOR SELECT TO authenticated
  USING (
    founder_id = auth.uid() 
    OR 
    public.is_pod_member(id, auth.uid())
  );

-- 5. INSERT policy: Allow any authenticated user to create a pod
CREATE POLICY "pods_insert"
  ON public.pods FOR INSERT TO authenticated
  WITH CHECK (
    founder_id = auth.uid()
  );

-- 6. UPDATE policy: Founder only
CREATE POLICY "pods_update"
  ON public.pods FOR UPDATE TO authenticated
  USING (founder_id = auth.uid())
  WITH CHECK (founder_id = auth.uid());

-- 7. DELETE policy: Founder only
CREATE POLICY "pods_delete"
  ON public.pods FOR DELETE TO authenticated
  USING (founder_id = auth.uid());

-- 8. Fix pod_members policies to be more restrictive
DROP POLICY IF EXISTS "pod_members_select" ON public.pod_members;
CREATE POLICY "pod_members_select"
  ON public.pod_members FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() -- Can see own membership
    OR 
    public.is_pod_member(pod_id, auth.uid()) -- Can see other members in same pod
  );

-- 9. Fix pod_members INSERT/UPDATE/DELETE to use founder_id from pods table for consistency
DROP POLICY IF EXISTS "pod_members_insert" ON public.pod_members;
CREATE POLICY "pod_members_insert"
  ON public.pod_members FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() -- Allow joining via invitation (self-insert)
    OR
    EXISTS (
      SELECT 1 FROM public.pods 
      WHERE id = pod_id AND founder_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pod_members_update" ON public.pod_members;
CREATE POLICY "pod_members_update"
  ON public.pod_members FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pods 
      WHERE id = pod_id AND founder_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pod_members_delete" ON public.pod_members;
CREATE POLICY "pod_members_delete"
  ON public.pod_members FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pods
      WHERE id = pod_id AND founder_id = auth.uid()
    )
  );

-- 10. Fix pod_invitations policies to allow non-members to join
DROP POLICY IF EXISTS "pod_invitations_select" ON public.pod_invitations;
CREATE POLICY "pod_invitations_select"
  ON public.pod_invitations FOR SELECT TO authenticated
  USING (
    public.is_pod_member(pod_id, auth.uid()) -- Members can see all invites
    OR
    is_active = true -- Non-members can see active invites to join (needed for joinPod)
  );

DROP POLICY IF EXISTS "pod_invitations_insert" ON public.pod_invitations;
CREATE POLICY "pod_invitations_insert"
  ON public.pod_invitations FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pod_members 
      WHERE pod_id = public.pod_invitations.pod_id 
      AND user_id = auth.uid() 
      AND role IN ('FOUNDER', 'POD_MANAGER')
    )
  );

DROP POLICY IF EXISTS "pod_invitations_update" ON public.pod_invitations;
CREATE POLICY "pod_invitations_update"
  ON public.pod_invitations FOR UPDATE TO authenticated
  USING (
    public.is_pod_member(pod_id, auth.uid()) -- Members (usually founder/manager)
    OR
    is_active = true -- Non-members can update used_count when joining
  );

DROP POLICY IF EXISTS "pod_invitations_delete" ON public.pod_invitations;
CREATE POLICY "pod_invitations_delete"
  ON public.pod_invitations FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pod_members 
      WHERE pod_id = public.pod_invitations.pod_id 
      AND user_id = auth.uid() 
      AND role = 'FOUNDER'
    )
  );

