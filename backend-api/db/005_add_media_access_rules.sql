ALTER TABLE media_child_access
ADD COLUMN IF NOT EXISTS is_allowed BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE media_child_access
ADD COLUMN IF NOT EXISTS no_limit BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE media_child_access
ADD COLUMN IF NOT EXISTS daily_limit_minutes INTEGER;

ALTER TABLE media_child_access
ADD COLUMN IF NOT EXISTS available_from TIMESTAMPTZ;

ALTER TABLE media_child_access
ADD COLUMN IF NOT EXISTS available_until TIMESTAMPTZ;

ALTER TABLE media_child_access
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_media_child_access_is_allowed
ON media_child_access(is_allowed);

CREATE INDEX IF NOT EXISTS idx_media_child_access_available_from
ON media_child_access(available_from);

CREATE INDEX IF NOT EXISTS idx_media_child_access_available_until
ON media_child_access(available_until);
