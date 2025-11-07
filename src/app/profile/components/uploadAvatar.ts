import http from '@/services/http';

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file); // Backend expects 'file' as the key
  const response = await http.post('/profile/upload-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
