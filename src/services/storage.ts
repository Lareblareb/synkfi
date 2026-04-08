import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';

const BUCKET = 'synk-avatars';

export const storageService = {
  async uploadAvatar(userId: string, uri: string): Promise<string> {
    const response = await fetch(uri);
    const blob = await response.blob();

    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve) => {
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });

    const filePath = `${userId}/avatar-${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, decode(base64), {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  },

  async deleteAvatar(filePath: string): Promise<void> {
    const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
    if (error) throw error;
  },

  getAvatarUrl(filePath: string): string {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  },
};
