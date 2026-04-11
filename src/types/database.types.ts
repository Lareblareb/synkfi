export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'pro';
export type EventStatus = 'active' | 'cancelled' | 'completed' | 'draft';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type PaymentMethod = 'card' | 'google_pay' | 'apple_pay';
export type ConnectionStatus = 'pending' | 'accepted' | 'declined';
export type GenderPreference = 'any' | 'men' | 'women' | 'mixed';

export type SportType =
  | 'football'
  | 'basketball'
  | 'tennis'
  | 'running'
  | 'cycling'
  | 'swimming'
  | 'volleyball'
  | 'padel'
  | 'badminton'
  | 'ice_hockey'
  | 'floorball'
  | 'gym_fitness'
  | 'board_games'
  | 'other';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      events: {
        Row: EventRow;
        Insert: EventInsert;
        Update: EventUpdate;
      };
      event_participants: {
        Row: EventParticipantRow;
        Insert: EventParticipantInsert;
        Update: EventParticipantUpdate;
      };
      messages: {
        Row: MessageRow;
        Insert: MessageInsert;
        Update: MessageUpdate;
      };
      connections: {
        Row: ConnectionRow;
        Insert: ConnectionInsert;
        Update: ConnectionUpdate;
      };
      notifications: {
        Row: NotificationRow;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
      };
      stripe_webhooks: {
        Row: StripeWebhookRow;
        Insert: StripeWebhookInsert;
        Update: StripeWebhookUpdate;
      };
    };
  };
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  location: unknown;
  location_name: string;
  sports: SportType[];
  sport_skills: Record<string, SkillLevel> | null;
  interests: string[] | null;
  education: string | null;
  photos: string[] | null;
  age: number | null;
  skill_level: SkillLevel;
  availability: Record<string, boolean> | null;
  fcm_token: string | null;
  stripe_customer_id: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface UserInsert {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  bio?: string | null;
  location?: unknown;
  location_name?: string;
  sports?: SportType[];
  sport_skills?: Record<string, SkillLevel> | null;
  interests?: string[] | null;
  education?: string | null;
  photos?: string[] | null;
  age?: number | null;
  skill_level?: SkillLevel;
  availability?: Record<string, boolean> | null;
  fcm_token?: string | null;
  stripe_customer_id?: string | null;
  preferred_language?: string;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  avatar_url?: string | null;
  bio?: string | null;
  location?: unknown;
  location_name?: string;
  sports?: SportType[];
  sport_skills?: Record<string, SkillLevel> | null;
  interests?: string[] | null;
  education?: string | null;
  photos?: string[] | null;
  age?: number | null;
  skill_level?: SkillLevel;
  availability?: Record<string, boolean> | null;
  fcm_token?: string | null;
  stripe_customer_id?: string | null;
  preferred_language?: string;
  updated_at?: string;
}

export interface EventRow {
  id: string;
  title: string;
  sport: SportType;
  description: string | null;
  date_time: string;
  location: unknown;
  location_name: string;
  city: string;
  max_participants: number;
  current_participants: number;
  venue_cost: number;
  cost_per_person: number;
  skill_level: SkillLevel;
  gender_preference: GenderPreference;
  created_by: string;
  status: EventStatus;
  created_at: string;
  updated_at: string;
}

export interface EventInsert {
  title: string;
  sport: SportType;
  description?: string | null;
  date_time: string;
  location: unknown;
  location_name: string;
  city?: string;
  max_participants: number;
  venue_cost?: number;
  skill_level?: SkillLevel;
  gender_preference?: GenderPreference;
  created_by: string;
}

export interface EventUpdate {
  title?: string;
  sport?: SportType;
  description?: string | null;
  date_time?: string;
  location?: unknown;
  location_name?: string;
  city?: string;
  max_participants?: number;
  venue_cost?: number;
  skill_level?: SkillLevel;
  gender_preference?: GenderPreference;
  status?: EventStatus;
  updated_at?: string;
}

export interface EventParticipantRow {
  id: string;
  event_id: string;
  user_id: string;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  stripe_payment_intent_id: string | null;
  joined_at: string;
}

export interface EventParticipantInsert {
  event_id: string;
  user_id: string;
  payment_status?: PaymentStatus;
  payment_method?: PaymentMethod | null;
  stripe_payment_intent_id?: string | null;
}

export interface EventParticipantUpdate {
  payment_status?: PaymentStatus;
  payment_method?: PaymentMethod | null;
  stripe_payment_intent_id?: string | null;
}

export interface MessageRow {
  id: string;
  event_id: string | null;
  sender_id: string;
  receiver_id: string | null;
  message: string;
  is_direct: boolean;
  read_by: string[];
  created_at: string;
}

export interface MessageInsert {
  event_id?: string | null;
  sender_id: string;
  receiver_id?: string | null;
  message: string;
  is_direct?: boolean;
  read_by?: string[];
}

export interface MessageUpdate {
  read_by?: string[];
}

export interface ConnectionRow {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
}

export interface ConnectionInsert {
  requester_id: string;
  addressee_id: string;
  status?: ConnectionStatus;
}

export interface ConnectionUpdate {
  status?: ConnectionStatus;
  updated_at?: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title_en: string;
  title_fi: string;
  body_en: string;
  body_fi: string;
  data: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

export interface NotificationInsert {
  user_id: string;
  type: string;
  title_en: string;
  title_fi: string;
  body_en: string;
  body_fi: string;
  data?: Record<string, unknown> | null;
  read?: boolean;
}

export interface NotificationUpdate {
  read?: boolean;
}

export interface StripeWebhookRow {
  id: string;
  event_type: string;
  stripe_event_id: string;
  payload: Record<string, unknown>;
  processed: boolean;
  created_at: string;
}

export interface StripeWebhookInsert {
  event_type: string;
  stripe_event_id: string;
  payload: Record<string, unknown>;
  processed?: boolean;
}

export interface StripeWebhookUpdate {
  processed?: boolean;
}
