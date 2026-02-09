-- Drop foreign key constraints on parent_child_links that reference auth.users
-- Child user IDs are generated UUIDs not in auth.users
ALTER TABLE public.parent_child_links DROP CONSTRAINT IF EXISTS parent_child_links_child_user_id_fkey;
ALTER TABLE public.parent_child_links DROP CONSTRAINT IF EXISTS parent_child_links_parent_user_id_fkey;