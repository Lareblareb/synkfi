export const HELSINKI_CENTER = {
  latitude: 60.1699,
  longitude: 24.9384,
};

export const DEFAULT_SEARCH_RADIUS_KM = 10;

export const MAP_INITIAL_REGION = {
  latitude: HELSINKI_CENTER.latitude,
  longitude: HELSINKI_CENTER.longitude,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const AVATAR_COLORS = [
  '#C5F135',
  '#A8D420',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#EF4444',
] as const;

export const getAvatarColor = (name: string | null | undefined): string => {
  if (!name || name.length === 0) return AVATAR_COLORS[0];
  const code = name.charCodeAt(0);
  const index = isNaN(code) ? 0 : Math.abs(code) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

export const MESSAGE_GROUP_THRESHOLD_MS = 60000;

export const MAX_PARTICIPANTS_DEFAULT = 20;
export const MIN_PARTICIPANTS = 2;

export const DISTANCE_OPTIONS = [1, 3, 5, 10, 25];

export const BRAND_PHRASES = [
  'PLAY TO CONNECT',
  'WHERE STUDENTS MEET',
  'NOT NETWORKING — REAL CONNECTION',
  'CONNECTION',
  'MOVEMENT',
  'COMMUNITY',
];
