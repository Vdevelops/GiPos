'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UploadService } from '../services/upload.service';

/**
 * Hook to upload an image file
 */
export function useUploadImage() {
  return useMutation({
    mutationFn: async ({ file, folder }: { file: File; folder?: string }) => {
      const response = await UploadService.uploadImage(file, folder);
      // UploadService returns the response directly, not wrapped in ApiResponse
      return response;
    },
    onSuccess: () => {
      toast.success('Image uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload image');
    },
  });
}

/**
 * Hook to delete an image file
 */
export function useDeleteImage() {
  return useMutation({
    mutationFn: async (url: string) => {
      await UploadService.deleteImage(url);
    },
    onSuccess: () => {
      toast.success('Image deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete image');
    },
  });
}
