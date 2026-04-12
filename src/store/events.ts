import { create } from 'zustand';
import { EventFilters, DEFAULT_FILTERS, EventWithCreator, CreateEventData } from '../types/event.types';
import { eventsService } from '../services/events';
import { participantsService } from '../services/participants';

interface EventsState {
  events: EventWithCreator[];
  currentEvent: EventWithCreator | null;
  myJoinedEvents: EventWithCreator[];
  myCreatedEvents: EventWithCreator[];
  filters: EventFilters;
  viewMode: 'map' | 'list';
  isLoading: boolean;
  error: string | null;
  setFilters: (filters: Partial<EventFilters>) => void;
  resetFilters: () => void;
  setViewMode: (mode: 'map' | 'list') => void;
  fetchEvents: (userLat: number, userLng: number, userId: string) => Promise<void>;
  fetchEventById: (eventId: string, userId: string) => Promise<void>;
  fetchMyJoinedEvents: (userId: string) => Promise<void>;
  fetchMyCreatedEvents: (userId: string) => Promise<void>;
  createEvent: (data: CreateEventData, userId: string) => Promise<string>;
  joinEvent: (eventId: string, userId: string) => Promise<void>;
  leaveEvent: (eventId: string, userId: string) => Promise<void>;
  cancelEvent: (eventId: string) => Promise<void>;
  clearError: () => void;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  currentEvent: null,
  myJoinedEvents: [],
  myCreatedEvents: [],
  filters: DEFAULT_FILTERS,
  viewMode: 'list',
  isLoading: false,
  error: null,

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  setViewMode: (mode) => set({ viewMode: mode }),

  fetchEvents: async (userLat, userLng, userId) => {
    set({ isLoading: true, error: null });
    try {
      const events = await eventsService.getEvents(
        get().filters,
        userLat,
        userLng,
        userId
      );
      set({ events, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
    }
  },

  fetchEventById: async (eventId, userId) => {
    set({ isLoading: true, error: null });
    try {
      const event = await eventsService.getEventById(eventId, userId);
      set({ currentEvent: event, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
    }
  },

  fetchMyJoinedEvents: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const events = await eventsService.getMyJoinedEvents(userId);
      set({ myJoinedEvents: events, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
    }
  },

  fetchMyCreatedEvents: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const events = await eventsService.getMyCreatedEvents(userId);
      set({ myCreatedEvents: events, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
    }
  },

  createEvent: async (data, userId) => {
    set({ isLoading: true, error: null });
    try {
      const event = await eventsService.createEvent({
        title: data.title,
        sport: data.sport,
        description: data.description || null,
        date_time: data.date_time,
        location_name: data.location_name || 'Helsinki',
        max_participants: data.max_participants,
        venue_cost: data.venue_cost || 0,
        skill_level: data.skill_level,
        gender_preference: data.gender_preference,
        created_by: userId,
      });
      set({ isLoading: false, error: null });
      return event.id;
    } catch (err) {
      const errorMsg = (err as Error)?.message ?? 'Failed to create event';
      console.error('Create event failed:', errorMsg);
      set({ isLoading: false, error: errorMsg });
      throw err;
    }
  },

  joinEvent: async (eventId, userId) => {
    set({ isLoading: true, error: null });
    try {
      await participantsService.joinEvent(eventId, userId, 'paid');
      const event = await eventsService.getEventById(eventId, userId);
      set({ currentEvent: event, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
      throw err;
    }
  },

  leaveEvent: async (eventId, userId) => {
    set({ isLoading: true, error: null });
    try {
      await participantsService.leaveEvent(eventId, userId);
      const event = await eventsService.getEventById(eventId, userId);
      set({ currentEvent: event, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
      throw err;
    }
  },

  cancelEvent: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      await eventsService.cancelEvent(eventId);
      set({ isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
