import { useEffect, useCallback } from 'react';
import { useNotificationsStore } from '../store/notifications';
import { useAuthStore } from '../store/auth';
import { notificationsService } from '../services/notifications';
import { NotificationRow } from '../types/database.types';
import { useNavigation } from '@react-navigation/native';

export const useNotifications = () => {
  const store = useNotificationsStore();
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation();

  const refresh = useCallback(async () => {
    if (!user) return;
    await store.fetchNotifications(user.id);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!user) return;

    const channel = notificationsService.subscribeToNotifications(
      user.id,
      (payload) => {
        store.addNotification(payload as unknown as NotificationRow);
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  useEffect(() => {
    const subscription = notificationsService.addNotificationResponseListener(
      (response) => {
        const data = response.notification.request.content.data as Record<
          string,
          string
        >;
        if (data?.type === 'event' && data?.event_id) {
          (navigation as Record<string, Function>).navigate('EventDetail', {
            eventId: data.event_id,
          });
        } else if (data?.type === 'chat' && data?.event_id) {
          (navigation as Record<string, Function>).navigate('GroupChat', {
            eventId: data.event_id,
          });
        } else if (data?.type === 'dm' && data?.user_id) {
          (navigation as Record<string, Function>).navigate('DirectMessage', {
            userId: data.user_id,
          });
        } else if (data?.type === 'connection') {
          (navigation as Record<string, Function>).navigate('Connect');
        }
      }
    );

    return () => subscription.remove();
  }, [navigation]);

  return { ...store, refresh };
};
