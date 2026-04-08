import { useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { authService } from '../services/auth';
import { notificationsService } from '../services/notifications';

export const useAuth = () => {
  const store = useAuthStore();

  useEffect(() => {
    const { data: subscription } = authService.onAuthStateChange(
      async (event: string, session: unknown) => {
        if (event === 'SIGNED_IN' && session) {
          store.setSession(session);
          await store.loadUserProfile();
        } else if (event === 'SIGNED_OUT') {
          store.setUser(null);
          store.setSession(null);
        }
      }
    );

    store.loadUserProfile();

    return () => {
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (store.user?.id) {
      notificationsService.registerForPushNotifications().then((token) => {
        if (token && store.user) {
          authService.updateFcmToken(store.user.id, token);
        }
      });
    }
  }, [store.user?.id]);

  return store;
};
