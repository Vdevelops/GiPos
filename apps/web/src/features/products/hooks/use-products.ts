'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductService } from '../services/product.service';
import type {
  Product,
  ProductListQuery,
  CreateProductRequest,
  UpdateProductRequest,
} from '../types';
import { toast } from '@/lib/toast';

/**
 * Hook to get list of products
 */
export function useProducts(query?: ProductListQuery) {
  return useQuery({
    queryKey: ['products', query],
    queryFn: () => ProductService.list(query),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to get product by ID
 */
export function useProduct(id: string | null) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => {
      if (!id) throw new Error('Product ID is required');
      return ProductService.getById(id);
    },
    enabled: !!id,
  });
}

/**
 * Hook to get product by SKU
 */
export function useProductBySKU(sku: string | null) {
  return useQuery({
    queryKey: ['product', 'sku', sku],
    queryFn: () => {
      if (!sku) throw new Error('SKU is required');
      return ProductService.getBySKU(sku);
    },
    enabled: !!sku,
  });
}

/**
 * Hook to get product by barcode
 */
export function useProductByBarcode(barcode: string | null) {
  return useQuery({
    queryKey: ['product', 'barcode', barcode],
    queryFn: () => {
      if (!barcode) throw new Error('Barcode is required');
      return ProductService.getByBarcode(barcode);
    },
    enabled: !!barcode,
  });
}

/**
 * Hook to create product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => ProductService.create(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast.success('Product created successfully');
      } else {
        toast.error(response.error?.message || 'Failed to create product');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create product');
    },
  });
}

/**
 * Hook to update product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      ProductService.update(id, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
        toast.success('Product updated successfully');
      } else {
        toast.error(response.error?.message || 'Failed to update product');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update product');
    },
  });
}

/**
 * Hook to delete product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ProductService.delete(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast.success('Product deleted successfully');
      } else {
        toast.error(response.error?.message || 'Failed to delete product');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete product');
    },
  });
}
