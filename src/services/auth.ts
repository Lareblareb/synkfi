import { Linking, Platform } from 'react-native';
import { supabase } from './supabase';
import { UserInsert, UserUpdate, SportType, SkillLevel } from '../types/database.types';
import { ProfileSetupData } from '../types/user.types';

let WebBrowser: typeof import('expo-web-browser') | null = null;
try {
  WebBrowser = require('expo-web-browser');
} catch {
  WebBrowser = null;
}

const REDIRECT_URL = 'synk://auth/callback';

const ensureUserProfile = async (
  userId: string,
  email: string,
  name: string
): Promise<void> => {
  try {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (existing) return;

    const userInsert: UserInsert = {
      id: userId,
      name: name || email.split('@')[0] || 'User',
      email,
      sports: [],
      skill_level: 'beginner',
      location_name: 'Helsinki, Finland',
      preferred_language: 'en',
    };

    await supabase.from('users').insert(userInsert);
  } catch (err) {
    console.warn('Failed to ensure user profile:', err);
  }
};

export const authService = {
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { name },
        emailRedirectTo: REDIRECT_URL,
      },
    });
    if (error) throw error;

    if (data.user) {
      await ensureUserProfile(data.user.id, data.user.email ?? email, name);
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;

    if (data.user) {
      const userName =
        (data.user.user_metadata?.name as string | undefined) ??
        data.user.email?.split('@')[0] ??
        'User';
      await ensureUserProfile(data.user.id, data.user.email ?? email, userName);
    }

    return data;
  },

  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: REDIRECT_URL,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url && WebBrowser) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          REDIRECT_URL
        );

        if (result.type === 'success' && result.url) {
          const params = new URL(result.url).hash.substring(1);
          const urlParams = new URLSearchParams(params);
          const accessToken = urlParams.get('access_token');
          const refreshToken = urlParams.get('refresh_token');

          if (accessToken && refreshToken) {
            const { data: sessionData, error: sessionError } =
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
            if (sessionError) throw sessionError;

            if (sessionData.user) {
              const userName =
                (sessionData.user.user_metadata?.name as string | undefined) ??
                (sessionData.user.user_metadata?.full_name as string | undefined) ??
                sessionData.user.email?.split('@')[0] ??
                'User';
              await ensureUserProfile(
                sessionData.user.id,
                sessionData.user.email ?? '',
                userName
              );
            }

            return sessionData;
          }
        }
      } else if (data?.url) {
        await Linking.openURL(data.url);
      }

      return data;
    } catch (err) {
      console.warn('Google sign-in failed:', err);
      throw err;
    }
  },

  async signInWithApple() {
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign-In is only available on iOS');
    }
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: REDIRECT_URL,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url && WebBrowser) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          REDIRECT_URL
        );

        if (result.type === 'success' && result.url) {
          const params = new URL(result.url).hash.substring(1);
          const urlParams = new URLSearchParams(params);
          const accessToken = urlParams.get('access_token');
          const refreshToken = urlParams.get('refresh_token');

          if (accessToken && refreshToken) {
            const { data: sessionData, error: sessionError } =
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
            if (sessionError) throw sessionError;

            if (sessionData.user) {
              const userName =
                (sessionData.user.user_metadata?.full_name as string | undefined) ??
                sessionData.user.email?.split('@')[0] ??
                'User';
              await ensureUserProfile(
                sessionData.user.id,
                sessionData.user.email ?? '',
                userName
              );
            }

            return sessionData;
          }
        }
      }

      return data;
    } catch (err) {
      console.warn('Apple sign-in failed:', err);
      throw err;
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: REDIRECT_URL }
    );
    if (error) throw error;
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  async completeProfileSetup(userId: string, data: ProfileSetupData) {
    const update: UserUpdate = {
      name: data.name,
      avatar_url: data.avatar_uri,
      sports: data.sports as SportType[],
      skill_level: data.skill_level as SkillLevel,
      location_name: data.location_name,
    };

    const { error } = await supabase.from('users').update(update).eq('id', userId);
    if (error) throw error;
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, update: UserUpdate) {
    const { error } = await supabase
      .from('users')
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
  },

  async updateFcmToken(userId: string, token: string) {
    const { error } = await supabase
      .from('users')
      .update({ fcm_token: token })
      .eq('id', userId);
    if (error) throw error;
  },

  async updateLanguage(userId: string, language: string) {
    const { error } = await supabase
      .from('users')
      .update({ preferred_language: language })
      .eq('id', userId);
    if (error) throw error;
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
