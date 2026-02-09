-- Drop the foreign key constraint that prevents child profiles from being created
-- Child profiles use generated UUIDs not linked to auth.users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;