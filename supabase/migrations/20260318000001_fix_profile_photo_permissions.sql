-- 1. Allow parents to update profile avatars for children they created
-- Current profile RLS only allows users to update their own profile.
-- We add a policy so parents can update child profiles.
DROP POLICY IF EXISTS "Parents can update child profiles" ON public.profiles;
CREATE POLICY "Parents can update child profiles"
ON public.profiles FOR UPDATE
USING (
  auth.uid() = user_id OR 
  created_by_parent = auth.uid()
)
WITH CHECK (
  auth.uid() = user_id OR 
  created_by_parent = auth.uid()
);

-- 2. Storage Policies for Avatars
-- Ensure authenticated users (parents) can upload to their children's folders
DROP POLICY IF EXISTS "Users can manage their own and children avatars" ON storage.objects;
CREATE POLICY "Users can manage their own and children avatars"
ON storage.objects FOR ALL
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 3. Storage Policies for Kids Photos
DROP POLICY IF EXISTS "Users can manage kids photos" ON storage.objects;
CREATE POLICY "Users can manage kids photos"
ON storage.objects FOR ALL
USING (bucket_id = 'kids-photos' AND auth.role() = 'authenticated');

-- 4. Enable RLS on kids_photos table if not already
ALTER TABLE public.kids_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Parents can manage kids photos" ON public.kids_photos;
CREATE POLICY "Parents can manage kids photos"
ON public.kids_photos FOR ALL
USING (parent_user_id = auth.uid());

DROP POLICY IF EXISTS "Children can see their own shared photos" ON public.kids_photos;
CREATE POLICY "Children can see their own shared photos"
ON public.kids_photos FOR SELECT
USING (child_profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = child_profile_id AND p.created_by_parent = auth.uid()));
