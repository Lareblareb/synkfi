-- DEMO ACCOUNTS FOR SYNK
--
-- Run this in Supabase SQL Editor AFTER running 001_initial_schema.sql
--
-- This creates real auth users you can log in with.
-- Login credentials:
--   demo1@synk.fi / Demo12345!
--   demo2@synk.fi / Demo12345!
--   demo3@synk.fi / Demo12345!
--
-- NOTE: This uses Supabase's auth.users table directly which is allowed
-- via the admin API. If RLS blocks this, run it as the service role or
-- sign up normally through the app after disabling email confirmation.

-- Demo user 1: Han (like one of the team members)
DO $$
DECLARE
  demo1_id uuid;
  demo2_id uuid;
  demo3_id uuid;
BEGIN
  -- Create demo user 1
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'demo1@synk.fi',
    crypt('Demo12345!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Han Doan"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id INTO demo1_id;

  IF demo1_id IS NOT NULL THEN
    INSERT INTO public.users (id, name, email, bio, sports, skill_level, location_name, preferred_language)
    VALUES (
      demo1_id,
      'Han Doan',
      'demo1@synk.fi',
      'Digital Marketing & Community at Synk. Love basketball and running around Helsinki.',
      ARRAY['basketball', 'running', 'padel'],
      'intermediate',
      'Helsinki, Finland',
      'en'
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      bio = EXCLUDED.bio,
      sports = EXCLUDED.sports;
  END IF;

  -- Create demo user 2
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'demo2@synk.fi',
    crypt('Demo12345!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Chau Tran"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id INTO demo2_id;

  IF demo2_id IS NOT NULL THEN
    INSERT INTO public.users (id, name, email, bio, sports, skill_level, location_name, preferred_language)
    VALUES (
      demo2_id,
      'Chau Tran',
      'demo2@synk.fi',
      'Marketing & Growth at Synk. Tennis and swimming enthusiast.',
      ARRAY['tennis', 'swimming', 'volleyball'],
      'advanced',
      'Helsinki, Finland',
      'en'
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      bio = EXCLUDED.bio,
      sports = EXCLUDED.sports;
  END IF;

  -- Create demo user 3
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'demo3@synk.fi',
    crypt('Demo12345!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Anna Virtanen"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id INTO demo3_id;

  IF demo3_id IS NOT NULL THEN
    INSERT INTO public.users (id, name, email, bio, sports, skill_level, location_name, preferred_language)
    VALUES (
      demo3_id,
      'Anna Virtanen',
      'demo3@synk.fi',
      'University of Helsinki student. New to Synk, looking forward to joining events!',
      ARRAY['football', 'ice_hockey', 'floorball'],
      'beginner',
      'Helsinki, Finland',
      'fi'
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      bio = EXCLUDED.bio,
      sports = EXCLUDED.sports;
  END IF;

END $$;

-- Verify accounts were created
SELECT email, raw_user_meta_data->>'name' AS name FROM auth.users WHERE email LIKE 'demo%@synk.fi';
