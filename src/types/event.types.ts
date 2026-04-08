import {
  EventRow,
  EventStatus,
  GenderPreference,
  PaymentStatus,
  SkillLevel,
  SportType,
} from './database.types';

export interface EventWithCreator extends EventRow {
  creator: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  participants: EventParticipant[];
  is_joined: boolean;
  is_creator: boolean;
}

export interface EventParticipant {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  payment_status: PaymentStatus;
  joined_at: string;
}

export interface EventFilters {
  sports: SportType[];
  skillLevel: SkillLevel | 'any';
  distance: number;
  dateRange: 'today' | 'tomorrow' | 'this_week' | 'this_weekend' | 'custom' | null;
  customDate: string | null;
  gender: GenderPreference;
}

export const DEFAULT_FILTERS: EventFilters = {
  sports: [],
  skillLevel: 'any',
  distance: 10,
  dateRange: null,
  customDate: null,
  gender: 'any',
};

export interface CreateEventStep1 {
  sport: SportType;
  title: string;
  description: string;
  skill_level: SkillLevel;
  gender_preference: GenderPreference;
}

export interface CreateEventStep2 {
  date_time: string;
  location_name: string;
  latitude: number;
  longitude: number;
  max_participants: number;
}

export interface CreateEventStep3 {
  venue_cost: number;
}

export type CreateEventData = CreateEventStep1 & CreateEventStep2 & CreateEventStep3;

export interface EventMapMarkerData {
  id: string;
  latitude: number;
  longitude: number;
  sport: SportType;
  title: string;
  current_participants: number;
  max_participants: number;
}

export const SPORT_EMOJI: Record<SportType, string> = {
  football: '⚽',
  basketball: '🏀',
  tennis: '🎾',
  running: '🏃',
  cycling: '🚴',
  swimming: '🏊',
  volleyball: '🏐',
  padel: '🏓',
  badminton: '🏸',
  ice_hockey: '🏒',
  floorball: '🥍',
  gym_fitness: '💪',
  board_games: '🎲',
  other: '🤸',
};

export const SPORT_LABELS: Record<SportType, string> = {
  football: 'Football',
  basketball: 'Basketball',
  tennis: 'Tennis',
  running: 'Running',
  cycling: 'Cycling',
  swimming: 'Swimming',
  volleyball: 'Volleyball',
  padel: 'Padel',
  badminton: 'Badminton',
  ice_hockey: 'Ice Hockey',
  floorball: 'Floorball',
  gym_fitness: 'Gym & Fitness',
  board_games: 'Board Games',
  other: 'Other',
};

export const SPORT_LIST: SportType[] = [
  'football',
  'basketball',
  'tennis',
  'running',
  'cycling',
  'swimming',
  'volleyball',
  'padel',
  'badminton',
  'ice_hockey',
  'floorball',
  'gym_fitness',
  'board_games',
  'other',
];
