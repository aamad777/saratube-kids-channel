
DROP POLICY "Authenticated can insert kids photos" ON public.kids_photos;
CREATE POLICY "Authenticated can insert kids photos" ON public.kids_photos
  FOR INSERT TO authenticated
  WITH CHECK (parent_user_id = auth.uid()::text);
