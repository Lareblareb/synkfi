import { ConnectionRow, ConnectionStatus } from './database.types';

export interface ConnectionWithUser extends ConnectionRow {
  user: {
    id: string;
    name: string;
    avatar_url: string | null;
    bio: string | null;
    sports: string[];
    skill_level: string;
    location_name: string;
  };
}

export interface ConnectFilter {
  type: 'student' | 'organization' | 'idea' | null;
}

export const CONNECT_FILTERS = [
  {
    type: 'student' as const,
    emoji: '🎓',
    label: 'A student looking to join',
  },
  {
    type: 'organization' as const,
    emoji: '💛',
    label: 'An organization interested in collaboration',
  },
  {
    type: 'idea' as const,
    emoji: '💡',
    label: 'Someone with an idea to build with us',
  },
] as const;
