#!/usr/bin/env bash
set -euo pipefail

SOURCE="/var/lib/docker/volumes/supabase_storage_mlnqnfmxzqeqzjmefpiy/_data/"
DEST="/mnt/webapps/supabase-data/storage/"

mkdir -p "$DEST"

echo "Syncing Supabase Storage to NAS..."

rsync -rltDvh --delete \
  --no-owner --no-group --no-perms \
  "$SOURCE" \
  "$DEST"

echo "Done."
du -sh "$DEST"
