-- Migration 002: Extended user profile fields
-- Run this in Supabase SQL Editor AFTER 001_initial_schema.sql

-- Add new profile columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS sport_skills jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS education text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS age integer;

-- Add indexes for the new array columns
CREATE INDEX IF NOT EXISTS idx_users_interests ON public.users USING GIN (interests);
CREATE INDEX IF NOT EXISTS idx_users_sport_skills ON public.users USING GIN (sport_skills);

-- Ensure RLS still allows users to update their own profile with new columns
-- (existing policies should still work since they check auth.uid() = id)

-- Verify changes
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
