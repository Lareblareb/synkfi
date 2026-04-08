import { supabase } from './supabase';
import { UserInsert, UserUpdate, SportType, SkillLevel } from '../types/database.types';
import { ProfileSetupData } from '../types/user.types';

export const authService = {
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error) throw error;

    if (data.user) {
      const userInsert: UserInsert = {
        id: data.user.id,
        name,
        email,
        sports: [],
        skill_level: 'beginner',
        location_name: 'Helsinki, Finland',
        preferred_language: 'en',
      };
      const { error: profileError } = await supabase.from('users').insert(userInsert);
      if (profileError) throw profileError;
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) throw error;
    return data;
  },

  async signInWithApple() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
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
