import { useEffect, useCallback } from 'react';
import { useConnectionsStore } from '../store/connections';
import { useAuthStore } from '../store/auth';

export const useConnections = () => {
  const store = useConnectionsStore();
  const user = useAuthStore((s) => s.user);

  const refresh = useCallback(async () => {
    if (!user) return;
    await Promise.all([
      store.fetchConnections(user.id),
      store.fetchPendingRequests(user.id),
      store.fetchMembers(store.filter),
    ]);
  }, [user?.id, store.filter]);

  useEffect(() => {
    refresh();
  }, [store.filter]);

  return { ...store, refresh };
};

export const usePublicProfile = (userId: string) => {
  const store = useConnectionsStore();
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    if (currentUser && userId) {
      store.fetchPublicProfile(userId, currentUser.id);
    }
  }, [userId, currentUser?.id]);

  return {
    profile: store.currentProfile,
    isLoading: store.isLoading,
    error: store.error,
  };
};
