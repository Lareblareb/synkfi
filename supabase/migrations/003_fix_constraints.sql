-- Migration 003: Fix check constraints that were wrong in 001
-- Run this in Supabase SQL Editor

-- Fix gender_preference constraint (was using male/female/non_binary, should be men/women/mixed)
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_gender_preference_check;
ALTER TABLE public.events
  ADD CONSTRAINT events_gender_preference_check
  CHECK (gender_preference IN ('any', 'men', 'women', 'mixed'));

-- Also make location column truly nullable (it should already be, but ensure)
ALTER TABLE public.events ALTER COLUMN location DROP NOT NULL;

-- Fix status constraint to include 'draft' for future use
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_status_check;
ALTER TABLE public.events
  ADD CONSTRAINT events_status_check
  CHECK (status IN ('active', 'cancelled', 'completed', 'full', 'draft'));

-- Verify
SELECT con.conname, pg_get_constraintdef(con.oid)
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'events' AND con.contype = 'c';
