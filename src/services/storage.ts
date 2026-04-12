import { supabase } from './supabase';

const BUCKET = 'synk-avatars';

const uriToBlob = async (uri: string): Promise<Blob> => {
  const response = await fetch(uri);
  return response.blob();
};

export const storageService = {
  async uploadAvatar(userId: string, uri: string): Promise<string> {
    try {
      const blob = await uriToBlob(uri);
      const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
      const filePath = `${userId}/avatar-${Date.now()}.${ext}`;

      // Upload using blob directly (works better in RN than base64)
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, blob, {
          contentType,
          upsert: true,
        });

      if (uploadError) {
        console.error('Avatar upload error:', JSON.stringify(uploadError));
        throw new Error(uploadError.message || 'Upload failed');
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.error('Avatar upload failed:', err);
      throw err;
    }
  },

  async uploadPhoto(userId: string, uri: string): Promise<string> {
    try {
      const blob = await uriToBlob(uri);
      const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
      const filePath = `${userId}/photos/photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, blob, {
          contentType,
          upsert: true,
        });

      if (uploadError) {
        console.error('Photo upload error:', JSON.stringify(uploadError));
        throw new Error(uploadError.message || 'Upload failed');
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.error('Photo upload failed:', err);
      throw err;
    }
  },

  getAvatarUrl(filePath: string): string {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  },
};
