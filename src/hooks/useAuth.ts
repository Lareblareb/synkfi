import { useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { authService } from '../services/auth';
import { notificationsService } from '../services/notifications';

export const useAuth = () => {
  const store = useAuthStore();

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    try {
      const result = authService.onAuthStateChange(
        async (event: string, session: unknown) => {
          try {
            if (event === 'SIGNED_IN' && session) {
              store.setSession(session);
              await store.loadUserProfile();
            } else if (event === 'SIGNED_OUT') {
              store.setUser(null);
              store.setSession(null);
            }
          } catch (err) {
            console.warn('Auth state change error:', err);
          }
        }
      );

      // Supabase v2 returns { data: { subscription: { unsubscribe } } }
      const sub = (result as { data?: { subscription?: { unsubscribe: () => void } } })
        ?.data?.subscription;
      if (sub) {
        subscription = sub;
      }
    } catch (err) {
      console.warn('Failed to setup auth listener:', err);
    }

    store.loadUserProfile().catch((err) => {
      console.warn('Failed to load user profile:', err);
    });

    return () => {
      try {
        subscription?.unsubscribe();
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!store.user?.id) return;
    notificationsService
      .registerForPushNotifications()
      .then((token) => {
        if (token && store.user) {
          authService.updateFcmToken(store.user.id, token).catch((err) => {
            console.warn('Failed to update FCM token:', err);
          });
        }
      })
      .catch((err) => {
        console.warn('Failed to register for push notifications:', err);
      });
  }, [store.user?.id]);

  return store;
};
