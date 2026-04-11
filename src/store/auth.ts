import { create } from 'zustand';
import { UserRow } from '../types/database.types';
import { authService } from '../services/auth';
import { ProfileSetupData } from '../types/user.types';

interface AuthState {
  user: UserRow | null;
  session: unknown;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProfileComplete: boolean;
  error: string | null;
  setUser: (user: UserRow | null) => void;
  setSession: (session: unknown) => void;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  completeProfileSetup: (data: ProfileSetupData) => Promise<void>;
  loadUserProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  isProfileComplete: false,
  error: null,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isProfileComplete: !!user && Array.isArray(user.sports) && user.sports.length > 0,
    }),

  setSession: (session) => set({ session }),

  signUp: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      await authService.signUp(email, password, name);
      set({ isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
      throw err;
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.signIn(email, password);
      if (data.user) {
        const profile = await authService.getUserProfile(data.user.id);
        set({
          user: profile,
          session: data.session,
          isAuthenticated: true,
          isProfileComplete: Array.isArray(profile.sports) && profile.sports.length > 0,
          isLoading: false,
        });
      }
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
      throw err;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await authService.signOut();
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isProfileComplete: false,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
    }
  },

  resetPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await authService.resetPassword(email);
      set({ isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
      throw err;
    }
  },

  completeProfileSetup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const user = get().user;
      if (!user) throw new Error('No user');
      await authService.completeProfileSetup(user.id, data);
      const updatedProfile = await authService.getUserProfile(user.id);
      set({
        user: updatedProfile,
        isProfileComplete: true,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
      throw err;
    }
  },

  loadUserProfile: async () => {
    try {
      const session = await authService.getSession();
      if (session?.user) {
        try {
          const profile = await authService.getUserProfile(session.user.id);
          set({
            user: profile,
            session,
            isAuthenticated: true,
            isProfileComplete: Array.isArray(profile.sports) && profile.sports.length > 0,
          });
        } catch {
          set({ isAuthenticated: false, user: null });
        }
      } else {
        set({ isAuthenticated: false, user: null });
      }
    } catch {
      set({ isAuthenticated: false, user: null });
    }
  },

  clearError: () => set({ error: null }),
}));
