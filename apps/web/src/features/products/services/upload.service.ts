import { apiRequest } from '@/lib/api';

export interface UploadImageResponse {
  url: string;
  folder: string;
}

export interface DeleteImageRequest {
  url: string;
}

export class UploadService {
  private static basePath = '/upload';

  /**
   * Upload an image file
   */
  static async uploadImage(
    file: File,
    folder: string = 'products'
  ): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add folder as query parameter instead of form data
    const url = `${this.basePath}/image?folder=${encodeURIComponent(folder)}`;

    const response = await apiRequest<UploadImageResponse>(url, {
      method: 'POST',
      body: formData,
      requireAuth: true,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message_en || 'Failed to upload image');
    }

    return response.data;
  }

  /**
   * Delete an image file
   */
  static async deleteImage(url: string): Promise<void> {
    return apiRequest<void>(`${this.basePath}/image`, {
      method: 'DELETE',
      body: JSON.stringify({ url }),
    });
  }
}
