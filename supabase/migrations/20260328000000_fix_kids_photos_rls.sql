
-- 1. Fix kids_photos RLS policies to allow children to share photos with their parents
-- Dropping the restrictive policy from migration 20260318000001
DROP POLICY IF EXISTS "Parents can manage kids photos" ON public.kids_photos;

-- 2. Allow parents to see and manage their children's photos
CREATE POLICY "Parents can manage kids photos"
ON public.kids_photos FOR ALL
USING (parent_user_id = auth.uid()::text)
WITH CHECK (parent_user_id = auth.uid()::text);

-- 3. Allow children to INSERT shared photos with their parent
-- They can insert if they are the one mentioned in the child_profile_id column
CREATE POLICY "Children can insert shared photos"
ON public.kids_photos FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id::text = child_profile_id
    AND profiles.user_id = auth.uid()
  )
);

-- 4. Allow children to SELECT their own shared photos (also in case they want to see them in a feed)
DROP POLICY IF EXISTS "Children can see their own shared photos" ON public.kids_photos;
CREATE POLICY "Children can see their own shared photos"
ON public.kids_photos FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id::text = child_profile_id
    AND profiles.user_id = auth.uid()
  )
);

-- 5. Extra check for Storage bucket if needed (though it was already quite broad)
-- Ensuring authenticated users can upload to kids-photos
DROP POLICY IF EXISTS "Users can manage kids photos" ON storage.objects;
CREATE POLICY "Users can manage kids photos"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'kids-photos')
WITH CHECK (bucket_id = 'kids-photos');
