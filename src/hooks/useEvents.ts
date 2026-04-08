import { useEffect, useCallback } from 'react';
import { useEventsStore } from '../store/events';
import { useAuthStore } from '../store/auth';
import { useLocation } from './useLocation';

export const useEvents = () => {
  const store = useEventsStore();
  const user = useAuthStore((s) => s.user);
  const { location } = useLocation();

  const refresh = useCallback(async () => {
    if (!user) return;
    await store.fetchEvents(location.latitude, location.longitude, user.id);
  }, [user, location.latitude, location.longitude, store.filters]);

  useEffect(() => {
    refresh();
  }, [store.filters]);

  return { ...store, refresh };
};

export const useEventDetail = (eventId: string) => {
  const store = useEventsStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user && eventId) {
      store.fetchEventById(eventId, user.id);
    }
  }, [eventId, user?.id]);

  return {
    event: store.currentEvent,
    isLoading: store.isLoading,
    error: store.error,
    refresh: () => user && store.fetchEventById(eventId, user.id),
  };
};

export const useMyEvents = () => {
  const store = useEventsStore();
  const user = useAuthStore((s) => s.user);

  const refresh = useCallback(async () => {
    if (!user) return;
    await Promise.all([
      store.fetchMyJoinedEvents(user.id),
      store.fetchMyCreatedEvents(user.id),
    ]);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, []);

  return {
    joinedEvents: store.myJoinedEvents,
    createdEvents: store.myCreatedEvents,
    isLoading: store.isLoading,
    refresh,
  };
};
