-- ============================================================================
-- Synk Sports Community App - Initial Schema Migration
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users
CREATE TABLE public.users (
    id              uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    name            text,
    email           text,
    avatar_url      text,
    bio             text,
    location        geography(Point, 4326) DEFAULT ST_SetSRID(ST_MakePoint(24.9384, 60.1699), 4326)::geography,
    location_name   text DEFAULT 'Helsinki, Finland',
    sports          text[] DEFAULT '{}',
    skill_level     text DEFAULT 'beginner'
                        CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'pro')),
    availability    jsonb,
    fcm_token       text,
    stripe_customer_id text,
    preferred_language text DEFAULT 'en',
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now()
);

-- Events
CREATE TABLE public.events (
    id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title                text NOT NULL,
    sport                text NOT NULL,
    description          text,
    date_time            timestamptz NOT NULL,
    location             geography(Point, 4326),
    location_name        text,
    city                 text DEFAULT 'Helsinki',
    max_participants     int,
    current_participants int DEFAULT 1,
    venue_cost           numeric DEFAULT 0,
    cost_per_person      numeric GENERATED ALWAYS AS (
                             CASE WHEN current_participants > 0
                                  THEN venue_cost / current_participants
                                  ELSE 0
                             END
                         ) STORED,
    skill_level          text DEFAULT 'beginner'
                             CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'pro')),
    gender_preference    text DEFAULT 'any'
                             CHECK (gender_preference IN ('any', 'male', 'female', 'non_binary')),
    created_by           uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    status               text DEFAULT 'active'
                             CHECK (status IN ('active', 'cancelled', 'completed', 'full')),
    created_at           timestamptz DEFAULT now(),
    updated_at           timestamptz DEFAULT now()
);

-- Event participants
CREATE TABLE public.event_participants (
    id                      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id                uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
    user_id                 uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    payment_status          text DEFAULT 'pending'
                                CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method          text CHECK (payment_method IN ('stripe', 'cash', 'free', NULL)),
    stripe_payment_intent_id text,
    joined_at               timestamptz DEFAULT now(),
    UNIQUE (event_id, user_id)
);

-- Messages
CREATE TABLE public.messages (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id    uuid REFERENCES public.events (id) ON DELETE CASCADE,
    sender_id   uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    receiver_id uuid REFERENCES public.users (id) ON DELETE SET NULL,
    message     text NOT NULL,
    is_direct   boolean DEFAULT false,
    read_by     uuid[] DEFAULT '{}',
    created_at  timestamptz DEFAULT now()
);

-- Connections (friend / buddy requests)
CREATE TABLE public.connections (
    id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id  uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    addressee_id  uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    status        text DEFAULT 'pending'
                      CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
    created_at    timestamptz DEFAULT now(),
    updated_at    timestamptz DEFAULT now(),
    UNIQUE (requester_id, addressee_id)
);

-- Notifications
CREATE TABLE public.notifications (
    id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    type       text NOT NULL,
    title_en   text,
    title_fi   text,
    body_en    text,
    body_fi    text,
    data       jsonb,
    read       boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Stripe webhook event log
CREATE TABLE public.stripe_webhooks (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type      text NOT NULL,
    stripe_event_id text UNIQUE NOT NULL,
    payload         jsonb NOT NULL,
    processed       boolean DEFAULT false,
    created_at      timestamptz DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Spatial indexes
CREATE INDEX idx_users_location       ON public.users       USING GIST (location);
CREATE INDEX idx_events_location      ON public.events      USING GIST (location);

-- Users
CREATE INDEX idx_users_email          ON public.users (email);
CREATE INDEX idx_users_skill_level    ON public.users (skill_level);
CREATE INDEX idx_users_sports         ON public.users USING GIN (sports);

-- Events
CREATE INDEX idx_events_created_by    ON public.events (created_by);
CREATE INDEX idx_events_sport         ON public.events (sport);
CREATE INDEX idx_events_status        ON public.events (status);
CREATE INDEX idx_events_date_time     ON public.events (date_time);
CREATE INDEX idx_events_city          ON public.events (city);
CREATE INDEX idx_events_skill_level   ON public.events (skill_level);

-- Event participants
CREATE INDEX idx_ep_event_id          ON public.event_participants (event_id);
CREATE INDEX idx_ep_user_id           ON public.event_participants (user_id);
CREATE INDEX idx_ep_payment_status    ON public.event_participants (payment_status);

-- Messages
CREATE INDEX idx_messages_event_id    ON public.messages (event_id);
CREATE INDEX idx_messages_sender_id   ON public.messages (sender_id);
CREATE INDEX idx_messages_receiver_id ON public.messages (receiver_id);
CREATE INDEX idx_messages_is_direct   ON public.messages (is_direct);
CREATE INDEX idx_messages_created_at  ON public.messages (created_at);

-- Connections
CREATE INDEX idx_connections_requester ON public.connections (requester_id);
CREATE INDEX idx_connections_addressee ON public.connections (addressee_id);
CREATE INDEX idx_connections_status    ON public.connections (status);

-- Notifications
CREATE INDEX idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX idx_notifications_read    ON public.notifications (read);
CREATE INDEX idx_notifications_type    ON public.notifications (type);

-- Stripe webhooks
CREATE INDEX idx_sw_event_type        ON public.stripe_webhooks (event_type);
CREATE INDEX idx_sw_processed         ON public.stripe_webhooks (processed);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_connections_updated_at
    BEFORE UPDATE ON public.connections
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- ---------- Users ----------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users: authenticated can view all users"
    ON public.users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users: can insert own profile"
    ON public.users FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

CREATE POLICY "Users: can update own profile"
    ON public.users FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ---------- Events ----------
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events: authenticated can view active events"
    ON public.events FOR SELECT
    TO authenticated
    USING (status = 'active' OR created_by = auth.uid());

CREATE POLICY "Events: authenticated can create events"
    ON public.events FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Events: creator can update own events"
    ON public.events FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Events: creator can delete own events"
    ON public.events FOR DELETE
    TO authenticated
    USING (created_by = auth.uid());

-- ---------- Event Participants ----------
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants: event members can view"
    ON public.event_participants FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR event_id IN (
            SELECT ep.event_id FROM public.event_participants ep WHERE ep.user_id = auth.uid()
        )
        OR event_id IN (
            SELECT e.id FROM public.events e WHERE e.created_by = auth.uid()
        )
    );

CREATE POLICY "Participants: can join events"
    ON public.event_participants FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Participants: can leave events"
    ON public.event_participants FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ---------- Messages ----------
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages: participants can view event messages"
    ON public.messages FOR SELECT
    TO authenticated
    USING (
        -- group messages: user is a participant of the event
        (
            is_direct = false
            AND event_id IS NOT NULL
            AND (
                event_id IN (
                    SELECT ep.event_id FROM public.event_participants ep WHERE ep.user_id = auth.uid()
                )
                OR event_id IN (
                    SELECT e.id FROM public.events e WHERE e.created_by = auth.uid()
                )
            )
        )
        -- direct messages: user is sender or receiver
        OR (is_direct = true AND (sender_id = auth.uid() OR receiver_id = auth.uid()))
    );

CREATE POLICY "Messages: authenticated can send messages"
    ON public.messages FOR INSERT
    TO authenticated
    WITH CHECK (sender_id = auth.uid());

-- ---------- Connections ----------
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Connections: can view own connections"
    ON public.connections FOR SELECT
    TO authenticated
    USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "Connections: can create connection requests"
    ON public.connections FOR INSERT
    TO authenticated
    WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Connections: addressee can update status"
    ON public.connections FOR UPDATE
    TO authenticated
    USING (addressee_id = auth.uid())
    WITH CHECK (addressee_id = auth.uid());

CREATE POLICY "Connections: participants can delete"
    ON public.connections FOR DELETE
    TO authenticated
    USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- ---------- Notifications ----------
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notifications: can view own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Notifications: can update own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ---------- Stripe Webhooks ----------
ALTER TABLE public.stripe_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stripe webhooks: service role can insert"
    ON public.stripe_webhooks FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Stripe webhooks: service role can select"
    ON public.stripe_webhooks FOR SELECT
    TO service_role
    USING (true);

CREATE POLICY "Stripe webhooks: service role can update"
    ON public.stripe_webhooks FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);
