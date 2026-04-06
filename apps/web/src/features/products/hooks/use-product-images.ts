'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ProductImageService,
  CreateProductImageRequest,
  BulkCreateProductImageRequest,
} from '../services/product-image.service';

// Query keys
const productImageKeys = {
  all: ['product-images'] as const,
  byProduct: (productId: string) => [...productImageKeys.all, 'product', productId] as const,
};

/**
 * Hook to fetch product images by product ID
 */
export function useProductImages(productId: string | null) {
  return useQuery({
    queryKey: productImageKeys.byProduct(productId ?? ''),
    queryFn: async () => {
      if (!productId) return { data: [] };
      const response = await ProductImageService.getByProductId(productId);
      return response;
    },
    enabled: !!productId,
  });
}

/**
 * Hook to create a product image
 */
export function useCreateProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      data,
    }: {
      productId: string;
      data: CreateProductImageRequest;
    }) => {
      return await ProductImageService.create(productId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productImageKeys.byProduct(variables.productId),
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Image added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add image');
    },
  });
}

/**
 * Hook to bulk create product images
 */
export function useBulkCreateProductImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      data,
    }: {
      productId: string;
      data: BulkCreateProductImageRequest;
    }) => {
      return await ProductImageService.bulkCreate(productId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productImageKeys.byProduct(variables.productId),
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Images added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add images');
    },
  });
}

/**
 * Hook to delete a product image
 */
export function useDeleteProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      imageId,
      productId,
    }: {
      imageId: string;
      productId: string;
    }) => {
      await ProductImageService.delete(imageId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productImageKeys.byProduct(variables.productId),
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Image deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete image');
    },
  });
}
