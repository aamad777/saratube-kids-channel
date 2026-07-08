CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  media_type TEXT NOT NULL CHECK (media_type IN ('video', 'photo')),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',

  file_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  thumbnail_url TEXT,

  original_filename TEXT,
  mime_type TEXT,
  size_bytes BIGINT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_files_media_type
ON media_files(media_type);

CREATE INDEX IF NOT EXISTS idx_media_files_owner_user_id
ON media_files(owner_user_id);

CREATE INDEX IF NOT EXISTS idx_media_files_created_at
ON media_files(created_at DESC);
