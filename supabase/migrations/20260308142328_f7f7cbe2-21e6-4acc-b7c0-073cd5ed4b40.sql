
-- Create avatars bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create kids-photos bucket for shared photos
INSERT INTO storage.buckets (id, name, public) VALUES ('kids-photos', 'kids-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatars bucket
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Users can update their own avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Users can delete their own avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');

-- RLS policies for kids-photos bucket
CREATE POLICY "Anyone can view kids photos" ON storage.objects FOR SELECT USING (bucket_id = 'kids-photos');
CREATE POLICY "Authenticated users can upload kids photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'kids-photos');
CREATE POLICY "Users can delete their own kids photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'kids-photos');

-- Create kids_photos table for shared photo metadata
CREATE TABLE public.kids_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id TEXT NOT NULL,
  parent_user_id TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kids_photos ENABLE ROW LEVEL SECURITY;

-- Parents can see their children's photos
CREATE POLICY "Parents can view their children photos" ON public.kids_photos
  FOR SELECT TO authenticated
  USING (parent_user_id = auth.uid()::text);

-- Allow insert for authenticated users
CREATE POLICY "Authenticated can insert kids photos" ON public.kids_photos
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Parents can delete their children's photos
CREATE POLICY "Parents can delete their children photos" ON public.kids_photos
  FOR DELETE TO authenticated
  USING (parent_user_id = auth.uid()::text);
