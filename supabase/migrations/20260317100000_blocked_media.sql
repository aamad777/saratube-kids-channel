-- Create a table to track blocked media (hidden by parents)
CREATE TABLE IF NOT EXISTS public.blocked_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id TEXT NOT NULL,
    parent_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(media_id, parent_user_id)
);

-- RLS Policies
ALTER TABLE public.blocked_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can manage their own blocked media"
ON public.blocked_media
FOR ALL
TO authenticated
USING (auth.uid() = parent_user_id)
WITH CHECK (auth.uid() = parent_user_id);
