import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';

const BUCKET = 'synk-avatars';

const uriToBase64 = async (uri: string): Promise<string> => {
  // Use fetch + Blob + FileReader for RN compatibility
  const response = await fetch(uri);
  const blob = await response.blob();

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('Empty file'));
        return;
      }
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
};

export const storageService = {
  async uploadAvatar(userId: string, uri: string): Promise<string> {
    try {
      const base64 = await uriToBase64(uri);
      const filePath = `${userId}/avatar-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, decode(base64), {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      if (!data?.publicUrl) {
        throw new Error('Failed to get public URL');
      }
      return data.publicUrl;
    } catch (err) {
      console.error('Avatar upload failed:', err);
      throw err;
    }
  },

  async uploadPhoto(userId: string, uri: string): Promise<string> {
    try {
      const base64 = await uriToBase64(uri);
      const filePath = `${userId}/photos/photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, decode(base64), {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error('Photo upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      if (!data?.publicUrl) {
        throw new Error('Failed to get public URL');
      }
      return data.publicUrl;
    } catch (err) {
      console.error('Photo upload failed:', err);
      throw err;
    }
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
