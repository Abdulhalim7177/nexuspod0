-- ============================================================
-- 021 — Notifications System
-- ============================================================

-- 1. Create notifications table
CREATE TABLE public.notifications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type          text NOT NULL CHECK (type IN (
    'TASK_ASSIGNED',
    'TASK_SUBMITTED',
    'TASK_APPROVED',
    'TASK_REJECTED',
    'TASK_DUE_SOON',
    'TASK_OVERDUE',
    'CHAT_MENTION',
    'CHAT_MESSAGE',
    'PROJECT_INVITE',
    'POD_INVITE',
    'MEMBER_JOINED',
    'PROJECT_REQUEST',
    'SYSTEM'
  )),
  
  title         text NOT NULL,
  body          text,
  link          text,
  
  related_id    uuid, -- Can reference task_id, project_id, pod_id, etc.
  related_type  text, -- 'task', 'project', 'pod', 'conversation', etc.
  
  is_read       boolean DEFAULT false,
  read_at       timestamptz,
  
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_notifications_user    ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type   ON public.notifications(type);
CREATE INDEX idx_notifications_related ON public.notifications(related_type, related_id);

-- 2. Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Users can only see their own notifications
CREATE POLICY "notifications_own_select"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_own_insert"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_own_update"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_own_delete"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 4. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 5. Helper function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text DEFAULT NULL,
  p_link text DEFAULT NULL,
  p_related_id uuid DEFAULT NULL,
  p_related_type text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    body,
    link,
    related_id,
    related_type
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_body,
    p_link,
    p_related_id,
    p_related_type
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- 6. Function to mark notifications as read
CREATE OR REPLACE FUNCTION public.mark_notifications_read(
  p_user_id uuid,
  p_notification_ids uuid[] DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_notification_ids IS NOT NULL THEN
    UPDATE public.notifications
    SET is_read = true, read_at = now()
    WHERE id = ANY(p_notification_ids) AND user_id = p_user_id;
  ELSE
    UPDATE public.notifications
    SET is_read = true, read_at = now()
    WHERE user_id = p_user_id AND is_read = false;
  END IF;
END;
$$;
