import { supabase } from "./client";

export const createAvatarsBucket = async () => {
  const { data, error } = await supabase
    .storage
    .createBucket('avatars', {
      public: true,
      fileSizeLimit: 1024 * 1024, // 1MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif']
    });

  if (error) {
    console.error('Error creating avatars bucket:', error);
    return;
  }

  console.log('Avatars bucket created:', data);
};