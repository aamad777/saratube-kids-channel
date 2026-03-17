-- Allow children to view their own photos
CREATE POLICY "Children can view their own photos"
ON public.kids_photos
FOR SELECT
TO authenticated
USING (child_profile_id = (auth.uid())::text);