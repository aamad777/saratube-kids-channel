CREATE TABLE IF NOT EXISTS media_child_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  media_id UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
  child_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(media_id, child_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_media_child_access_media_id
ON media_child_access(media_id);

CREATE INDEX IF NOT EXISTS idx_media_child_access_child_profile_id
ON media_child_access(child_profile_id);
