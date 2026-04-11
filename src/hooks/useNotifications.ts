import { useEffect, useCallback } from 'react';
import { useNotificationsStore } from '../store/notifications';
import { useAuthStore } from '../store/auth';
import { notificationsService } from '../services/notifications';
import { NotificationRow } from '../types/database.types';
import { useNavigation } from '@react-navigation/native';

type NavigateFn = (route: string, params?: Record<string, unknown>) => void;

export const useNotifications = () => {
  const store = useNotificationsStore();
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation();

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      await store.fetchNotifications(user.id);
    } catch (err) {
      console.warn('Failed to refresh notifications:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) return;

    let channel: { unsubscribe: () => void } | null = null;
    try {
      channel = notificationsService.subscribeToNotifications(
        user.id,
        (payload) => {
          try {
            store.addNotification(payload as unknown as NotificationRow);
          } catch (err) {
            console.warn('Failed to add notification:', err);
          }
        }
      );
    } catch (err) {
      console.warn('Failed to subscribe to notifications:', err);
    }

    return () => {
      try {
        channel?.unsubscribe();
      } catch {
        // ignore
      }
    };
  }, [user?.id]);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;
    try {
      subscription = notificationsService.addNotificationResponseListener(
        (response: unknown) => {
          try {
            const r = response as {
              notification?: {
                request?: { content?: { data?: Record<string, string> } };
              };
            };
            const data = r?.notification?.request?.content?.data;
            if (!data) return;

            const navigate = (navigation as unknown as { navigate: NavigateFn }).navigate;
            if (data.type === 'event' && data.event_id) {
              navigate('EventDetail', { eventId: data.event_id });
            } else if (data.type === 'chat' && data.event_id) {
              navigate('GroupChat', { eventId: data.event_id });
            } else if (data.type === 'dm' && data.user_id) {
              navigate('DirectMessage', { userId: data.user_id });
            } else if (data.type === 'connection') {
              navigate('Connect');
            }
          } catch (err) {
            console.warn('Failed to handle notification response:', err);
          }
        }
      );
    } catch (err) {
      console.warn('Failed to add notification listener:', err);
    }

    return () => {
      try {
        subscription?.remove();
      } catch {
        // ignore
      }
    };
  }, [navigation]);

  return { ...store, refresh };
};
