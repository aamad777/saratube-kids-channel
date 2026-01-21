-- Add new theme options to the app_theme enum
ALTER TYPE public.app_theme ADD VALUE IF NOT EXISTS 'unicorn';
ALTER TYPE public.app_theme ADD VALUE IF NOT EXISTS 'pirate';
ALTER TYPE public.app_theme ADD VALUE IF NOT EXISTS 'fairy';
ALTER TYPE public.app_theme ADD VALUE IF NOT EXISTS 'robot';