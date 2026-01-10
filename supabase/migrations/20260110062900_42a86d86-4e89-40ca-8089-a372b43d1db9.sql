-- Create parent-child relationship table
CREATE TABLE public.parent_child_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(parent_user_id, child_user_id)
);

-- Create time limits settings table
CREATE TABLE public.time_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  daily_limit_minutes INTEGER DEFAULT 60,
  bedtime_start TIME DEFAULT '20:00',
  bedtime_end TIME DEFAULT '07:00',
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity log table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id TEXT NOT NULL,
  video_title TEXT NOT NULL,
  watch_duration_seconds INTEGER DEFAULT 0,
  category TEXT,
  watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily watch time summary table
CREATE TABLE public.daily_watch_time (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  watch_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_seconds INTEGER DEFAULT 0,
  UNIQUE(user_id, watch_date)
);

-- Create blocked categories table
CREATE TABLE public.blocked_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  blocked_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(child_user_id, category)
);

-- Enable RLS on all tables
ALTER TABLE public.parent_child_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_watch_time ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_categories ENABLE ROW LEVEL SECURITY;

-- Parent-child links policies (parents can manage their links)
CREATE POLICY "Parents can view their child links" 
ON public.parent_child_links FOR SELECT 
USING (auth.uid() = parent_user_id);

CREATE POLICY "Parents can create child links" 
ON public.parent_child_links FOR INSERT 
WITH CHECK (auth.uid() = parent_user_id);

CREATE POLICY "Parents can delete child links" 
ON public.parent_child_links FOR DELETE 
USING (auth.uid() = parent_user_id);

-- Time limits policies
CREATE POLICY "Parents can view child time limits" 
ON public.time_limits FOR SELECT 
USING (
  auth.uid() = child_user_id OR
  EXISTS (SELECT 1 FROM parent_child_links WHERE parent_user_id = auth.uid() AND child_user_id = time_limits.child_user_id)
);

CREATE POLICY "Parents can insert child time limits" 
ON public.time_limits FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM parent_child_links WHERE parent_user_id = auth.uid() AND child_user_id = time_limits.child_user_id)
);

CREATE POLICY "Parents can update child time limits" 
ON public.time_limits FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM parent_child_links WHERE parent_user_id = auth.uid() AND child_user_id = time_limits.child_user_id)
);

-- Activity logs policies
CREATE POLICY "Users can insert own activity" 
ON public.activity_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own activity" 
ON public.activity_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Parents can view child activity" 
ON public.activity_logs FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM parent_child_links WHERE parent_user_id = auth.uid() AND child_user_id = activity_logs.user_id)
);

-- Daily watch time policies
CREATE POLICY "Users can manage own watch time" 
ON public.daily_watch_time FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Parents can view child watch time" 
ON public.daily_watch_time FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM parent_child_links WHERE parent_user_id = auth.uid() AND child_user_id = daily_watch_time.user_id)
);

-- Blocked categories policies
CREATE POLICY "Parents can manage blocked categories" 
ON public.blocked_categories FOR ALL 
USING (
  EXISTS (SELECT 1 FROM parent_child_links WHERE parent_user_id = auth.uid() AND child_user_id = blocked_categories.child_user_id)
);

CREATE POLICY "Children can view their blocked categories" 
ON public.blocked_categories FOR SELECT 
USING (auth.uid() = child_user_id);

-- Add is_parent flag to profiles
ALTER TABLE public.profiles ADD COLUMN is_parent BOOLEAN DEFAULT false;

-- Trigger for time_limits updated_at
CREATE TRIGGER update_time_limits_updated_at
BEFORE UPDATE ON public.time_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();