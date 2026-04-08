import { create } from 'zustand';
import { NotificationRow } from '../types/database.types';
import { notificationsService } from '../services/notifications';

interface NotificationsState {
  notifications: NotificationRow[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: (userId: string) => Promise<void>;
  fetchUnreadCount: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  addNotification: (notification: NotificationRow) => void;
  clearError: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await notificationsService.getNotifications(userId);
      const unreadCount = notifications.filter((n) => !n.read).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
    }
  },

  fetchUnreadCount: async (userId) => {
    try {
      const unreadCount = await notificationsService.getUnreadCount(userId);
      set({ unreadCount });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await notificationsService.markAsRead(notificationId);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  markAllAsRead: async (userId) => {
    try {
      await notificationsService.markAllAsRead(userId);
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.read ? 0 : 1),
    })),

  clearError: () => set({ error: null }),
}));
