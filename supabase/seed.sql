-- ============================================================================
-- Synk - Seed Data
-- Sample events in Helsinki for development / demo purposes
-- ============================================================================

-- We use fixed UUIDs so seed is idempotent and references stay consistent.
-- These users must already exist in auth.users (created via Supabase Auth).
-- For local dev you can insert them directly:

-- Sample auth users (only works in local dev with supabase start)
INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at, instance_id, aud, role)
VALUES
    ('a1b2c3d4-0001-4000-8000-000000000001', 'mikko@example.com',  '{"full_name":"Mikko Virtanen"}',  now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
    ('a1b2c3d4-0002-4000-8000-000000000002', 'aino@example.com',   '{"full_name":"Aino Korhonen"}',   now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
    ('a1b2c3d4-0003-4000-8000-000000000003', 'jari@example.com',   '{"full_name":"Jari Mäkinen"}',    now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
    ('a1b2c3d4-0004-4000-8000-000000000004', 'liisa@example.com',  '{"full_name":"Liisa Nieminen"}',  now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
    ('a1b2c3d4-0005-4000-8000-000000000005', 'tommi@example.com',  '{"full_name":"Tommi Laine"}',     now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Public user profiles
INSERT INTO public.users (id, name, email, bio, location, location_name, sports, skill_level, preferred_language)
VALUES
    (
        'a1b2c3d4-0001-4000-8000-000000000001',
        'Mikko Virtanen',
        'mikko@example.com',
        'Football enthusiast and weekend runner. Always up for a match!',
        ST_SetSRID(ST_MakePoint(24.9384, 60.1699), 4326)::geography,
        'Helsinki, Finland',
        ARRAY['football', 'running', 'padel'],
        'intermediate',
        'fi'
    ),
    (
        'a1b2c3d4-0002-4000-8000-000000000002',
        'Aino Korhonen',
        'aino@example.com',
        'Tennis player looking for hitting partners in Helsinki.',
        ST_SetSRID(ST_MakePoint(24.9210, 60.1870), 4326)::geography,
        'Töölö, Helsinki',
        ARRAY['tennis', 'padel', 'yoga'],
        'advanced',
        'fi'
    ),
    (
        'a1b2c3d4-0003-4000-8000-000000000003',
        'Jari Mäkinen',
        'jari@example.com',
        'Casual basketball player, love pickup games.',
        ST_SetSRID(ST_MakePoint(24.9500, 60.1690), 4326)::geography,
        'Kallio, Helsinki',
        ARRAY['basketball', 'football', 'ice_hockey'],
        'beginner',
        'en'
    ),
    (
        'a1b2c3d4-0004-4000-8000-000000000004',
        'Liisa Nieminen',
        'liisa@example.com',
        'Yoga instructor and avid cyclist. Lets ride!',
        ST_SetSRID(ST_MakePoint(24.8800, 60.1620), 4326)::geography,
        'Lauttasaari, Helsinki',
        ARRAY['yoga', 'cycling', 'swimming'],
        'pro',
        'fi'
    ),
    (
        'a1b2c3d4-0005-4000-8000-000000000005',
        'Tommi Laine',
        'tommi@example.com',
        'Ice hockey goalie needing skaters for pickup games.',
        ST_SetSRID(ST_MakePoint(25.0100, 60.2060), 4326)::geography,
        'Itäkeskus, Helsinki',
        ARRAY['ice_hockey', 'floorball'],
        'advanced',
        'en'
    )
ON CONFLICT (id) DO NOTHING;

-- Sample events
INSERT INTO public.events (id, title, sport, description, date_time, location, location_name, city, max_participants, current_participants, venue_cost, skill_level, gender_preference, created_by, status)
VALUES
    (
        'e1e1e1e1-0001-4000-8000-000000000001',
        '5-a-side Football at Brahen kenttä',
        'football',
        'Casual 5v5 on the outdoor pitch. Bring water and bibs if you have them.',
        now() + interval '3 days' + interval '18 hours',
        ST_SetSRID(ST_MakePoint(24.9480, 60.1830), 4326)::geography,
        'Brahen kenttä, Helsinki',
        'Helsinki',
        10,
        3,
        0,
        'intermediate',
        'any',
        'a1b2c3d4-0001-4000-8000-000000000001',
        'active'
    ),
    (
        'e1e1e1e1-0002-4000-8000-000000000002',
        'Tennis Singles at Talin tenniskeskus',
        'tennis',
        'Looking for a hitting partner for a 1-hour singles session. Court is booked.',
        now() + interval '2 days' + interval '10 hours',
        ST_SetSRID(ST_MakePoint(24.8760, 60.2070), 4326)::geography,
        'Talin Tenniskeskus, Helsinki',
        'Helsinki',
        2,
        1,
        30,
        'advanced',
        'any',
        'a1b2c3d4-0002-4000-8000-000000000002',
        'active'
    ),
    (
        'e1e1e1e1-0003-4000-8000-000000000003',
        'Pickup Basketball at Myllypuro',
        'basketball',
        'Friendly 3v3 half-court game. All levels welcome!',
        now() + interval '1 day' + interval '16 hours',
        ST_SetSRID(ST_MakePoint(25.0410, 60.2240), 4326)::geography,
        'Myllypuron liikuntapuisto, Helsinki',
        'Helsinki',
        6,
        2,
        0,
        'beginner',
        'any',
        'a1b2c3d4-0003-4000-8000-000000000003',
        'active'
    ),
    (
        'e1e1e1e1-0004-4000-8000-000000000004',
        'Morning Yoga in Seurasaari',
        'yoga',
        'Outdoor vinyasa flow session. Bring your own mat. I will guide the class.',
        now() + interval '4 days' + interval '7 hours',
        ST_SetSRID(ST_MakePoint(24.8830, 60.1830), 4326)::geography,
        'Seurasaari, Helsinki',
        'Helsinki',
        15,
        5,
        0,
        'beginner',
        'any',
        'a1b2c3d4-0004-4000-8000-000000000004',
        'active'
    ),
    (
        'e1e1e1e1-0005-4000-8000-000000000005',
        'Ice Hockey Pickup at Helsingin jäähalli',
        'ice_hockey',
        'Full gear required. Need skaters - I will be in goal. 1.5 h session.',
        now() + interval '5 days' + interval '20 hours',
        ST_SetSRID(ST_MakePoint(24.9290, 60.1880), 4326)::geography,
        'Helsingin Jäähalli, Helsinki',
        'Helsinki',
        12,
        4,
        120,
        'advanced',
        'any',
        'a1b2c3d4-0005-4000-8000-000000000005',
        'active'
    ),
    (
        'e1e1e1e1-0006-4000-8000-000000000006',
        'Padel Doubles at Helsinki Padel Center',
        'padel',
        'Booked a court for doubles. Need 2 more players. Fun competitive match.',
        now() + interval '2 days' + interval '19 hours',
        ST_SetSRID(ST_MakePoint(24.9650, 60.2100), 4326)::geography,
        'Helsinki Padel Center',
        'Helsinki',
        4,
        2,
        60,
        'intermediate',
        'any',
        'a1b2c3d4-0001-4000-8000-000000000001',
        'active'
    )
ON CONFLICT (id) DO NOTHING;

-- Seed some event participants (the creators auto-join, plus extras)
INSERT INTO public.event_participants (event_id, user_id, payment_status, payment_method)
VALUES
    -- Football: creator Mikko + Jari + Tommi
    ('e1e1e1e1-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'paid', 'free'),
    ('e1e1e1e1-0001-4000-8000-000000000001', 'a1b2c3d4-0003-4000-8000-000000000003', 'paid', 'free'),
    ('e1e1e1e1-0001-4000-8000-000000000001', 'a1b2c3d4-0005-4000-8000-000000000005', 'paid', 'free'),
    -- Tennis: creator Aino
    ('e1e1e1e1-0002-4000-8000-000000000002', 'a1b2c3d4-0002-4000-8000-000000000002', 'paid', 'stripe'),
    -- Basketball: creator Jari + Mikko
    ('e1e1e1e1-0003-4000-8000-000000000003', 'a1b2c3d4-0003-4000-8000-000000000003', 'paid', 'free'),
    ('e1e1e1e1-0003-4000-8000-000000000003', 'a1b2c3d4-0001-4000-8000-000000000001', 'paid', 'free'),
    -- Yoga: creator Liisa + Aino + Mikko + Jari + Tommi
    ('e1e1e1e1-0004-4000-8000-000000000004', 'a1b2c3d4-0004-4000-8000-000000000004', 'paid', 'free'),
    ('e1e1e1e1-0004-4000-8000-000000000004', 'a1b2c3d4-0002-4000-8000-000000000002', 'paid', 'free'),
    ('e1e1e1e1-0004-4000-8000-000000000004', 'a1b2c3d4-0001-4000-8000-000000000001', 'paid', 'free'),
    ('e1e1e1e1-0004-4000-8000-000000000004', 'a1b2c3d4-0003-4000-8000-000000000003', 'paid', 'free'),
    ('e1e1e1e1-0004-4000-8000-000000000004', 'a1b2c3d4-0005-4000-8000-000000000005', 'paid', 'free'),
    -- Ice Hockey: creator Tommi + Mikko + Jari + Aino
    ('e1e1e1e1-0005-4000-8000-000000000005', 'a1b2c3d4-0005-4000-8000-000000000005', 'paid', 'stripe'),
    ('e1e1e1e1-0005-4000-8000-000000000005', 'a1b2c3d4-0001-4000-8000-000000000001', 'paid', 'stripe'),
    ('e1e1e1e1-0005-4000-8000-000000000005', 'a1b2c3d4-0003-4000-8000-000000000003', 'pending', 'stripe'),
    ('e1e1e1e1-0005-4000-8000-000000000005', 'a1b2c3d4-0002-4000-8000-000000000002', 'pending', 'stripe'),
    -- Padel: creator Mikko + Aino
    ('e1e1e1e1-0006-4000-8000-000000000006', 'a1b2c3d4-0001-4000-8000-000000000001', 'paid', 'stripe'),
    ('e1e1e1e1-0006-4000-8000-000000000006', 'a1b2c3d4-0002-4000-8000-000000000002', 'paid', 'stripe')
ON CONFLICT (event_id, user_id) DO NOTHING;

-- Seed some connections
INSERT INTO public.connections (requester_id, addressee_id, status)
VALUES
    ('a1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0002-4000-8000-000000000002', 'accepted'),
    ('a1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0003-4000-8000-000000000003', 'accepted'),
    ('a1b2c3d4-0004-4000-8000-000000000004', 'a1b2c3d4-0002-4000-8000-000000000002', 'accepted'),
    ('a1b2c3d4-0005-4000-8000-000000000005', 'a1b2c3d4-0001-4000-8000-000000000001', 'pending'),
    ('a1b2c3d4-0003-4000-8000-000000000003', 'a1b2c3d4-0004-4000-8000-000000000004', 'pending')
ON CONFLICT (requester_id, addressee_id) DO NOTHING;

-- Seed a couple of group messages
INSERT INTO public.messages (event_id, sender_id, message, is_direct)
VALUES
    ('e1e1e1e1-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'Hey everyone! Excited for the match. Dont forget water!', false),
    ('e1e1e1e1-0001-4000-8000-000000000001', 'a1b2c3d4-0003-4000-8000-000000000003', 'Count me in. I will bring bibs.', false),
    ('e1e1e1e1-0005-4000-8000-000000000005', 'a1b2c3d4-0005-4000-8000-000000000005', 'Full gear is a must. Ice time starts sharp at 20:00.', false),
    ('e1e1e1e1-0005-4000-8000-000000000005', 'a1b2c3d4-0001-4000-8000-000000000001', 'Got it. See you there!', false);
