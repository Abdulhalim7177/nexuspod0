-- ============================================================
-- 020 — Files & Storage System
-- ============================================================

-- 1. Create files table
CREATE TABLE public.files (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  task_id         uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  pod_id          uuid REFERENCES public.pods(id) ON DELETE CASCADE,
  project_id      uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  
  uploader_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name       text NOT NULL,
  file_size       bigint NOT NULL,
  mime_type       text NOT NULL,
  file_url        text NOT NULL,
  storage_bucket  text NOT NULL DEFAULT 'files',
  
  is_voice_note   boolean DEFAULT false,
  voice_duration  integer,
  
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_files_conversation ON public.files(conversation_id);
CREATE INDEX idx_files_task        ON public.files(task_id);
CREATE INDEX idx_files_pod         ON public.files(pod_id);
CREATE INDEX idx_files_project     ON public.files(project_id);
CREATE INDEX idx_files_uploader    ON public.files(uploader_id);

-- 2. Enable RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Anyone in the same pod/project can view files
CREATE POLICY "files_select_authenticated"
  ON public.files FOR SELECT
  TO authenticated
  USING (
    -- User is member of the pod
    EXISTS (SELECT 1 FROM public.pod_members pm 
            WHERE pm.pod_id = files.pod_id AND pm.user_id = auth.uid())
    OR
    -- User is member of the project
    EXISTS (SELECT 1 FROM public.project_members pm 
            WHERE pm.project_id = files.project_id AND pm.user_id = auth.uid())
    OR
    -- User is the uploader
    uploader_id = auth.uid()
  );

-- Only authenticated users can insert their own files
CREATE POLICY "files_insert"
  ON public.files FOR INSERT
  TO authenticated
  WITH CHECK (uploader_id = auth.uid());

-- Only uploader can update/delete
CREATE POLICY "files_update_own"
  ON public.files FOR UPDATE
  USING (uploader_id = auth.uid());

CREATE POLICY "files_delete_own"
  ON public.files FOR DELETE
  USING (uploader_id = auth.uid());

-- 4. Create storage buckets
-- Files bucket (general files)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'files') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('files', 'files', true, 52428800, NULL);
  END IF;
END $$;

-- Voice notes bucket (shorter TTL)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'voice-notes') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('voice-notes', 'voice-notes', true, 10485760, ARRAY['audio/webm', 'audio/mp3', 'audio/wav', 'audio/ogg']);
  END IF;
END $$;

-- Avatars bucket
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
  END IF;
END $$;

-- Pod images bucket
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'pod-images') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('pod-images', 'pod-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);
  END IF;
END $$;

-- Project images bucket
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'project-images') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('project-images', 'project-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);
  END IF;
END $$;

-- 5. Storage RLS Policies
-- Files bucket - authenticated users can upload, pod/project members can view
CREATE POLICY "files_storage_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'files' AND auth.uid() IS NOT NULL
  );

CREATE POLICY "files_storage_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'files' 
  );

CREATE POLICY "files_storage_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'files');

CREATE POLICY "files_storage_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'files');

-- Voice notes bucket
CREATE POLICY "voice_notes_storage_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'voice-notes' AND auth.uid() IS NOT NULL
  );

CREATE POLICY "voice_notes_storage_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'voice-notes');

CREATE POLICY "voice_notes_storage_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'voice-notes');

-- Avatars bucket
CREATE POLICY "avatars_storage_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND auth.uid() IS NOT NULL
  );

CREATE POLICY "avatars_storage_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_storage_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_storage_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars');

-- Pod images bucket
CREATE POLICY "pod_images_storage_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'pod-images' AND auth.uid() IS NOT NULL
  );

CREATE POLICY "pod_images_storage_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'pod-images');

-- Project images bucket
CREATE POLICY "project_images_storage_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'project-images' AND auth.uid() IS NOT NULL
  );

CREATE POLICY "project_images_storage_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'project-images');

-- 6. Enable Realtime for files table
ALTER PUBLICATION supabase_realtime ADD TABLE public.files;
