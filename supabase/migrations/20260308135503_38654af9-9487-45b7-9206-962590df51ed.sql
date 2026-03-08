-- Add new Islamic and kid themes
ALTER TYPE public.app_theme ADD VALUE IF NOT EXISTS 'quran_stories';
ALTER TYPE public.app_theme ADD VALUE IF NOT EXISTS 'nasheed';
ALTER TYPE public.app_theme ADD VALUE IF NOT EXISTS 'ramadan';
ALTER TYPE public.app_theme ADD VALUE IF NOT EXISTS 'dua_prayer';
ALTER TYPE public.app_theme ADD VALUE IF NOT EXISTS 'farm';
ALTER TYPE public.app_theme ADD VALUE IF NOT EXISTS 'sports';
ALTER TYPE public.app_theme ADD VALUE IF NOT EXISTS 'cars';
ALTER TYPE public.app_theme ADD VALUE IF NOT EXISTS 'magic';

-- Add new video categories
ALTER TYPE public.video_category ADD VALUE IF NOT EXISTS 'quran_stories';
ALTER TYPE public.video_category ADD VALUE IF NOT EXISTS 'nasheed';
ALTER TYPE public.video_category ADD VALUE IF NOT EXISTS 'ramadan';
ALTER TYPE public.video_category ADD VALUE IF NOT EXISTS 'dua_prayer';
ALTER TYPE public.video_category ADD VALUE IF NOT EXISTS 'farm';
ALTER TYPE public.video_category ADD VALUE IF NOT EXISTS 'sports';
ALTER TYPE public.video_category ADD VALUE IF NOT EXISTS 'cars';
ALTER TYPE public.video_category ADD VALUE IF NOT EXISTS 'magic';