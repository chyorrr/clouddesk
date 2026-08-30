-- CloudDesk Database Schema (Idempotent / Safe to Re-run)
-- Run this in your Supabase SQL Editor

-- ============================================================
-- 1. FILESYSTEM TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.filesystem (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id           UUID REFERENCES public.filesystem(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  type                TEXT NOT NULL CHECK (type IN ('folder', 'file')),
  mime_type           TEXT,
  size                BIGINT,
  storage_path        TEXT,
  is_deleted          BOOLEAN NOT NULL DEFAULT false,
  deleted_at          TIMESTAMPTZ,
  original_parent_id  UUID,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure all columns exist if table was already created
ALTER TABLE public.filesystem ADD COLUMN IF NOT EXISTS mime_type TEXT;
ALTER TABLE public.filesystem ADD COLUMN IF NOT EXISTS size BIGINT;
ALTER TABLE public.filesystem ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE public.filesystem ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.filesystem ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.filesystem ADD COLUMN IF NOT EXISTS original_parent_id UUID;

-- Indexes for fast folder listing and search
CREATE INDEX IF NOT EXISTS idx_filesystem_user_parent 
  ON public.filesystem(user_id, parent_id);

CREATE INDEX IF NOT EXISTS idx_filesystem_user_deleted 
  ON public.filesystem(user_id, is_deleted);

CREATE INDEX IF NOT EXISTS idx_filesystem_name_search 
  ON public.filesystem USING gin(to_tsvector('english', name));

-- Auto-cleanup any duplicate root folders from previous sessions
DELETE FROM public.filesystem a
USING public.filesystem b
WHERE a.id > b.id
  AND a.user_id = b.user_id
  AND (a.parent_id IS NULL AND b.parent_id IS NULL)
  AND lower(a.name) = lower(b.name);

-- Row Level Security
ALTER TABLE public.filesystem ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own files" ON public.filesystem;
CREATE POLICY "Users can manage their own files"
  ON public.filesystem
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 2. USER SETTINGS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wallpaper     TEXT NOT NULL DEFAULT 'bliss',
  theme         TEXT NOT NULL DEFAULT 'classic',
  sound_enabled BOOLEAN NOT NULL DEFAULT false,
  icon_size     TEXT NOT NULL DEFAULT 'medium',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS wallpaper TEXT NOT NULL DEFAULT 'bliss';
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'classic';
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS sound_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS icon_size TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own settings" ON public.user_settings;
CREATE POLICY "Users can manage their own settings"
  ON public.user_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to resolve recipient user_id by username or email for CloudDesk Mail
CREATE OR REPLACE FUNCTION public.get_user_id_by_address(target_address TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_id UUID;
  clean_target TEXT := lower(trim(target_address));
  prefix_target TEXT := split_part(lower(trim(target_address)), '@', 1);
BEGIN
  -- 1. Check user_settings by email or username
  SELECT user_id INTO target_id
  FROM public.user_settings
  WHERE lower(email) = clean_target
     OR lower(username) = prefix_target
     OR lower(username) = clean_target
  LIMIT 1;

  IF target_id IS NOT NULL THEN
    RETURN target_id;
  END IF;

  -- 2. Check auth.users by email or username in metadata
  SELECT id INTO target_id
  FROM auth.users
  WHERE lower(email) = clean_target
     OR lower(raw_user_meta_data->>'username') = prefix_target
     OR lower(raw_user_meta_data->>'username') = clean_target
     OR lower(split_part(email, '@', 1)) = prefix_target
  LIMIT 1;

  RETURN target_id;
END;
$$;

-- ============================================================
-- 3. DESKTOP ICON POSITIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.desktop_icon_positions (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  icon_key  TEXT NOT NULL,
  x         INTEGER NOT NULL DEFAULT 16,
  y         INTEGER NOT NULL DEFAULT 16,
  UNIQUE(user_id, icon_key)
);

ALTER TABLE public.desktop_icon_positions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own icon positions" ON public.desktop_icon_positions;
CREATE POLICY "Users can manage their own icon positions"
  ON public.desktop_icon_positions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 4. STORAGE BUCKET
-- ============================================================

-- Create storage bucket if storage extension is available
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('user-files', 'user-files', false, 104857600)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS filesystem_updated_at ON public.filesystem;
CREATE TRIGGER filesystem_updated_at
  BEFORE UPDATE ON public.filesystem
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS user_settings_updated_at ON public.user_settings;
CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 6. EMAILS TABLE (User-to-User Transfer & Attachments)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.emails (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder           TEXT NOT NULL DEFAULT 'inbox' CHECK (folder IN ('inbox', 'sent', 'drafts', 'trash')),
  from_address     TEXT NOT NULL,
  to_address       TEXT NOT NULL,
  subject          TEXT NOT NULL,
  body             TEXT NOT NULL,
  read             BOOLEAN NOT NULL DEFAULT false,
  attachment_name  TEXT,
  attachment_size  BIGINT,
  attachment_mime  TEXT,
  attachment_data  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure all attachment columns exist if table was already created
ALTER TABLE public.emails ADD COLUMN IF NOT EXISTS attachment_name TEXT;
ALTER TABLE public.emails ADD COLUMN IF NOT EXISTS attachment_size BIGINT;
ALTER TABLE public.emails ADD COLUMN IF NOT EXISTS attachment_mime TEXT;
ALTER TABLE public.emails ADD COLUMN IF NOT EXISTS attachment_data TEXT;

CREATE INDEX IF NOT EXISTS idx_emails_user_folder ON public.emails(user_id, folder);

ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own emails" ON public.emails;
CREATE POLICY "Users can manage their own emails"
  ON public.emails
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 7. RECENT FILES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.recent_files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id     UUID NOT NULL REFERENCES public.filesystem(id) ON DELETE CASCADE,
  app_id      TEXT NOT NULL,
  opened_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, file_id)
);

ALTER TABLE public.recent_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own recent files" ON public.recent_files;
CREATE POLICY "Users can manage their own recent files"
  ON public.recent_files
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 8. STORAGE BUCKET & POLICIES (user-files)
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('user-files', 'user-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage object policies for user-files
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
CREATE POLICY "Authenticated users can upload files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'user-files');

DROP POLICY IF EXISTS "Users can read own files" ON storage.objects;
CREATE POLICY "Users can read own files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'user-files');

DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
CREATE POLICY "Users can update own files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'user-files');

DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'user-files');
