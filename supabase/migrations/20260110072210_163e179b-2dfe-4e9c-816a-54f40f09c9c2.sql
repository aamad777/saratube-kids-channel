-- Create videos table for parent-uploaded videos
CREATE TABLE public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  thumbnail_url text,
  video_url text NOT NULL,
  uploaded_by uuid NOT NULL,
  available_from timestamp with time zone DEFAULT now(),
  available_until timestamp with time zone,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on videos
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Parents can manage their own videos
CREATE POLICY "Users can view their own videos"
ON public.videos FOR SELECT
USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can insert their own videos"
ON public.videos FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own videos"
ON public.videos FOR UPDATE
USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own videos"
ON public.videos FOR DELETE
USING (auth.uid() = uploaded_by);

-- Create video_child_access table to control which children can see which videos
CREATE TABLE public.video_child_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  child_user_id uuid NOT NULL,
  granted_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(video_id, child_user_id)
);

-- Enable RLS on video_child_access
ALTER TABLE public.video_child_access ENABLE ROW LEVEL SECURITY;

-- Parents can manage access for their videos
CREATE POLICY "Video owners can manage child access"
ON public.video_child_access FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.videos 
    WHERE videos.id = video_child_access.video_id 
    AND videos.uploaded_by = auth.uid()
  )
);

-- Children can view their access entries
CREATE POLICY "Children can view their access"
ON public.video_child_access FOR SELECT
USING (auth.uid() = child_user_id);

-- Children can view videos they have access to (within time window)
CREATE POLICY "Children can view accessible videos"
ON public.videos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.video_child_access
    WHERE video_child_access.video_id = videos.id
    AND video_child_access.child_user_id = auth.uid()
  )
  AND (available_from IS NULL OR available_from <= now())
  AND (available_until IS NULL OR available_until >= now())
);

-- Create storage bucket for video uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);

-- Storage policies for video bucket
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger for updated_at on videos
CREATE TRIGGER update_videos_updated_at
BEFORE UPDATE ON public.videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();