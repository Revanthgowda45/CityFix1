import { supabase } from './supabase';

export const uploadImage = async (file: File, folder: string = 'issues'): Promise<string> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please upload an image file.');
    }

    // Validate file size (1.5MB)
    const maxSize = 1.5 * 1024 * 1024; // 1.5MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size exceeds 1.5MB limit.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload file to Supabase storage
    const { error: uploadError, data } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
};

export const deleteImage = async (url: string): Promise<void> => {
  try {
    const filePath = url.split('/').pop();
    if (!filePath) {
      throw new Error('Invalid file URL');
    }

    const { error } = await supabase.storage
      .from('images')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete image');
    }
  } catch (error) {
    console.error('Error in deleteImage:', error);
    throw error;
  }
}; 