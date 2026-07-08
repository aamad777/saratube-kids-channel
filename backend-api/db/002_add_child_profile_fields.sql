ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_parent BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS created_by_parent UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS pin_hash TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS child_login_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_created_by_parent
ON profiles(created_by_parent);

CREATE INDEX IF NOT EXISTS idx_profiles_is_parent
ON profiles(is_parent);
