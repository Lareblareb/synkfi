import { create } from 'zustand';
import { changeLanguage, getCurrentLanguage } from '../i18n';
import { authService } from '../services/auth';

interface SettingsState {
  language: 'en' | 'fi';
  pushEnabled: boolean;
  eventReminders: boolean;
  chatMessages: boolean;
  connectionRequests: boolean;
  nearbyEvents: boolean;
  setLanguage: (lang: 'en' | 'fi', userId?: string) => Promise<void>;
  togglePush: () => void;
  toggleEventReminders: () => void;
  toggleChatMessages: () => void;
  toggleConnectionRequests: () => void;
  toggleNearbyEvents: () => void;
  loadSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: (getCurrentLanguage() as 'en' | 'fi') || 'en',
  pushEnabled: true,
  eventReminders: true,
  chatMessages: true,
  connectionRequests: true,
  nearbyEvents: true,

  setLanguage: async (lang, userId) => {
    await changeLanguage(lang);
    if (userId) {
      await authService.updateLanguage(userId, lang);
    }
    set({ language: lang });
  },

  togglePush: () => set((state) => ({ pushEnabled: !state.pushEnabled })),
  toggleEventReminders: () =>
    set((state) => ({ eventReminders: !state.eventReminders })),
  toggleChatMessages: () =>
    set((state) => ({ chatMessages: !state.chatMessages })),
  toggleConnectionRequests: () =>
    set((state) => ({ connectionRequests: !state.connectionRequests })),
  toggleNearbyEvents: () =>
    set((state) => ({ nearbyEvents: !state.nearbyEvents })),

  loadSettings: () => {
    set({ language: (getCurrentLanguage() as 'en' | 'fi') || 'en' });
  },
}));
