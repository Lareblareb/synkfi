import { SkillLevel, SportType, UserRow } from './database.types';

export interface UserProfile extends Omit<UserRow, 'location'> {
  latitude: number;
  longitude: number;
  events_created_count?: number;
  events_joined_count?: number;
  connections_count?: number;
}

export interface PublicProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  location_name: string;
  sports: SportType[];
  skill_level: SkillLevel;
  events_created_count: number;
  events_joined_count: number;
  connections_count: number;
  is_connected: boolean;
  connection_status: 'none' | 'pending_sent' | 'pending_received' | 'accepted';
}

export interface ProfileSetupData {
  name: string;
  avatar_uri: string | null;
  sports: SportType[];
  skill_level: SkillLevel;
  location_name: string;
}

export interface TeamMember {
  name: string;
  role: string;
  email: string;
  phone: string;
  initial: string;
}

export const SYNK_TEAM: TeamMember[] = [
  {
    name: 'Han Doan',
    role: 'Digital Marketing & Community',
    email: 'handoan6@gmail.com',
    phone: '+358 40 181 2869',
    initial: 'H',
  },
  {
    name: 'Chau Tran',
    role: 'Marketing & Growth',
    email: 'tbaochau67@gmail.com',
    phone: '+358 41 310 1702',
    initial: 'C',
  },
];
