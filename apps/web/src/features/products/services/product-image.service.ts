import { apiRequest } from '@/lib/api';
import type { ProductImage } from '../types';

export interface CreateProductImageRequest {
  url: string;
  thumbnail_url?: string | null;
  order?: number;
  alt?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  mime_type?: string | null;
}

export interface BulkCreateProductImageRequest {
  images: CreateProductImageRequest[];
}

export interface ProductImageResponse {
  data: ProductImage;
}

export interface ProductImageListResponse {
  data: ProductImage[];
}

export class ProductImageService {
  /**
   * Create a product image
   */
  static async create(
    productId: string,
    data: CreateProductImageRequest
  ): Promise<ProductImageResponse> {
    const response = await apiRequest<ProductImageResponse>(
      `/products/${productId}/images`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message_en || 'Failed to create product image');
    }

    return response.data;
  }

  /**
   * Bulk create product images
   */
  static async bulkCreate(
    productId: string,
    data: BulkCreateProductImageRequest
  ): Promise<ProductImageListResponse> {
    const response = await apiRequest<ProductImageListResponse>(
      `/products/${productId}/images/bulk`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message_en || 'Failed to create product images');
    }

    return response.data;
  }

  /**
   * Get product images
   */
  static async getByProductId(productId: string): Promise<ProductImageListResponse> {
    const response = await apiRequest<ProductImageListResponse>(
      `/products/${productId}/images`,
      {
        method: 'GET',
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message_en || 'Failed to fetch product images');
    }

    return response.data;
  }

  /**
   * Delete a product image
   */
  static async delete(imageId: string): Promise<void> {
    const response = await apiRequest<void>(`/products/images/${imageId}`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.error?.message_en || 'Failed to delete product image');
    }
  }
}
