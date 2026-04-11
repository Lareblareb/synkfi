import { supabase } from './supabase';
import { NotificationRow } from '../types/database.types';
import { Platform } from 'react-native';

let notificationsModule: typeof import('expo-notifications') | null = null;
let handlerInitialized = false;

const getNotifications = (): typeof import('expo-notifications') | null => {
  if (notificationsModule) return notificationsModule;
  try {
    notificationsModule = require('expo-notifications');
    return notificationsModule;
  } catch (err) {
    console.warn('expo-notifications not available:', err);
    return null;
  }
};

const ensureHandlerInitialized = () => {
  if (handlerInitialized) return;
  const Notifications = getNotifications();
  if (!Notifications) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerInitialized = true;
  } catch (err) {
    console.warn('Failed to set notification handler:', err);
  }
};

export const notificationsService = {
  async registerForPushNotifications(): Promise<string | null> {
    try {
      const Notifications = getNotifications();
      if (!Notifications) return null;

      ensureHandlerInitialized();

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return null;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#C5F135',
        });
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      return tokenData.data;
    } catch (err) {
      console.warn('Failed to register for push notifications:', err);
      return null;
    }
  },

  async getNotifications(userId: string): Promise<NotificationRow[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data ?? [];
    } catch {
      return [];
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
    } catch (err) {
      console.warn('Failed to mark notification as read:', err);
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
    } catch (err) {
      console.warn('Failed to mark all notifications as read:', err);
    }
  },

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return count ?? 0;
    } catch {
      return 0;
    }
  },

  async sendPushNotification(
    userId: string,
    type: string,
    titleEn: string,
    titleFi: string,
    bodyEn: string,
    bodyFi: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    try {
      await supabase.functions.invoke('send-notification', {
        body: {
          user_id: userId,
          type,
          title_en: titleEn,
          title_fi: titleFi,
          body_en: bodyEn,
          body_fi: bodyFi,
          data,
        },
      });
    } catch (err) {
      console.warn('Failed to send push notification:', err);
    }
  },

  subscribeToNotifications(
    userId: string,
    callback: (notification: Record<string, unknown>) => void
  ) {
    return supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => callback(payload.new)
      )
      .subscribe();
  },

  addNotificationResponseListener(
    callback: (response: unknown) => void
  ): { remove: () => void } {
    try {
      const Notifications = getNotifications();
      if (!Notifications) return { remove: () => undefined };
      return Notifications.addNotificationResponseReceivedListener(callback);
    } catch (err) {
      console.warn('Failed to add notification listener:', err);
      return { remove: () => undefined };
    }
  },
};
