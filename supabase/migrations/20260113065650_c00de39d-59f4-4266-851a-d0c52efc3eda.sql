-- Add new themes to the app_theme enum
ALTER TYPE public.app_theme ADD VALUE IF NOT EXISTS 'superhero';
ALTER TYPE public.app_theme ADD VALUE IF NOT EXISTS 'dinosaur';