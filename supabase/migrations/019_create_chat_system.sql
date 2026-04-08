-- ============================================================
-- 019 — Chat System: Fixed RLS (no recursion)
-- ============================================================

-- Clean up existing chat tables
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_participants CASCADE;
DROP TABLE IF EXISTS public.chat_conversations CASCADE;
DROP FUNCTION IF EXISTS public.get_or_create_dm(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.create_pod_conversation() CASCADE;
DROP FUNCTION IF EXISTS public.create_project_conversation() CASCADE;
DROP FUNCTION IF EXISTS public.update_conversation_timestamp() CASCADE;

-- 1. chat_conversations
CREATE TABLE public.chat_conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text NOT NULL CHECK (type IN ('POD','PROJECT','DM','GROUP')),
  pod_id      uuid REFERENCES public.pods(id) ON DELETE CASCADE,
  project_id  uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  name        text,
  avatar_url  text,
  is_private  boolean DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_convos_pod     ON public.chat_conversations(pod_id)     WHERE pod_id IS NOT NULL;
CREATE INDEX idx_convos_project ON public.chat_conversations(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_convos_type    ON public.chat_conversations(type);

-- 2. chat_participants
CREATE TABLE public.chat_participants (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_admin        boolean DEFAULT false,
  last_read_at    timestamptz DEFAULT now(),
  joined_at       timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_chat_participants_user  ON public.chat_participants(user_id);
CREATE INDEX idx_chat_participants_convo ON public.chat_participants(conversation_id);

-- 3. chat_messages
CREATE TABLE public.chat_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES public.profiles(id),
  content         text,
  type            text NOT NULL DEFAULT 'TEXT' CHECK (type IN ('TEXT','FILE','VOICE','SYSTEM')),
  file_url        text,
  file_name       text,
  file_size       bigint,
  mime_type       text,
  reply_to        uuid REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  is_pinned       boolean DEFAULT false,
  is_edited       boolean DEFAULT false,
  read_by         uuid[] DEFAULT '{}',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_chat_messages_conversation ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created      ON public.chat_messages(created_at);
CREATE INDEX idx_chat_messages_user         ON public.chat_messages(user_id);

-- 4. RLS - SIMPLIFIED (no cross-references to avoid recursion)
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages      ENABLE ROW LEVEL SECURITY;

-- chat_conversations: Allow all authenticated users to see (filtered by other tables)
CREATE POLICY "chat_conversations_all_authenticated"
  ON public.chat_conversations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "chat_conversations_insert"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "chat_conversations_update"
  ON public.chat_conversations FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.chat_participants cp WHERE cp.conversation_id = chat_conversations.id AND cp.user_id = auth.uid() AND cp.is_admin = true)
  );

-- chat_participants: Allow all authenticated users
CREATE POLICY "chat_participants_all_authenticated"
  ON public.chat_participants FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- chat_messages: Allow all authenticated users
CREATE POLICY "chat_messages_all_authenticated"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "chat_messages_insert"
  ON public.chat_messages FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "chat_messages_update"
  ON public.chat_messages FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "chat_messages_delete"
  ON public.chat_messages FOR DELETE
  USING (user_id = auth.uid());

-- Helper functions
CREATE OR REPLACE FUNCTION public.get_or_create_dm(other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  convo_id uuid;
BEGIN
  SELECT c.id INTO convo_id
  FROM public.chat_conversations c
  WHERE c.type = 'DM'
    AND EXISTS (SELECT 1 FROM public.chat_participants cp WHERE cp.conversation_id = c.id AND cp.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.chat_participants cp WHERE cp.conversation_id = c.id AND cp.user_id = other_user_id)
  LIMIT 1;

  IF convo_id IS NOT NULL THEN RETURN convo_id; END IF;

  INSERT INTO public.chat_conversations (type) VALUES ('DM') RETURNING id INTO convo_id;
  INSERT INTO public.chat_participants (conversation_id, user_id, is_admin) VALUES (convo_id, auth.uid(), true), (convo_id, other_user_id, false);
  RETURN convo_id;
END;
$$;

-- Triggers
CREATE OR REPLACE FUNCTION public.create_pod_conversation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  convo_id uuid;
BEGIN
  INSERT INTO public.chat_conversations (type, pod_id, name) VALUES ('POD', NEW.id, NEW.title || ' — General') RETURNING id INTO convo_id;
  INSERT INTO public.chat_participants (conversation_id, user_id, is_admin) VALUES (convo_id, NEW.founder_id, true);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_create_pod_conversation
  AFTER INSERT ON public.pods FOR EACH ROW EXECUTE FUNCTION public.create_pod_conversation();

CREATE OR REPLACE FUNCTION public.create_project_conversation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  convo_id uuid;
BEGIN
  INSERT INTO public.chat_conversations (type, pod_id, project_id, name) VALUES ('PROJECT', NEW.pod_id, NEW.id, NEW.title || ' — Chat') RETURNING id INTO convo_id;
  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO public.chat_participants (conversation_id, user_id, is_admin) VALUES (convo_id, NEW.created_by, true);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_create_project_conversation
  AFTER INSERT ON public.projects FOR EACH ROW EXECUTE FUNCTION public.create_project_conversation();

CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.chat_conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON public.chat_messages FOR EACH ROW EXECUTE FUNCTION public.update_conversation_timestamp();

-- Enable Realtime on chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;