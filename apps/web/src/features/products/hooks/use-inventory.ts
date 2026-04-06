'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InventoryService } from '../services/inventory.service';
import type {
  ProductStock,
  CreateProductStockRequest,
  UpdateProductStockRequest,
  BulkCreateProductStockRequest,
} from '../types/inventory';
import { toast } from '@/lib/toast';

/**
 * Hook to get stocks for a product
 */
export function useProductStocks(productId: string | null) {
  return useQuery({
    queryKey: ['product-stocks', productId],
    queryFn: () => {
      if (!productId) throw new Error('Product ID is required');
      return InventoryService.getProductStocks(productId);
    },
    enabled: !!productId,
    staleTime: 10 * 1000, // 10 seconds for faster stock refresh
  });
}

/**
 * Hook to get total stock for a product
 */
export function useProductTotalStock(productId: string | null) {
  return useQuery({
    queryKey: ['product-total-stock', productId],
    queryFn: () => {
      if (!productId) throw new Error('Product ID is required');
      return InventoryService.getProductTotalStock(productId);
    },
    enabled: !!productId,
    staleTime: 10 * 1000, // 10 seconds for faster stock refresh
  });
}

/**
 * Hook to get stock by ID
 */
export function useStock(id: string | null) {
  return useQuery({
    queryKey: ['stock', id],
    queryFn: () => {
      if (!id) throw new Error('Stock ID is required');
      return InventoryService.getStockById(id);
    },
    enabled: !!id,
  });
}

/**
 * Hook to create product stock
 */
export function useCreateProductStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: CreateProductStockRequest;
    }) => InventoryService.createProductStock(productId, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['product-stocks', variables.productId] });
        queryClient.invalidateQueries({ queryKey: ['product-total-stock', variables.productId] });
        queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast.success('Stock created successfully');
      } else {
        toast.error(response.error?.message || 'Failed to create stock');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create stock');
    },
  });
}

/**
 * Hook to bulk create product stocks
 */
export function useBulkCreateProductStocks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: BulkCreateProductStockRequest;
    }) => InventoryService.bulkCreateProductStocks(productId, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['product-stocks', variables.productId] });
        queryClient.invalidateQueries({ queryKey: ['product-total-stock', variables.productId] });
        queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast.success('Stocks created successfully');
      } else {
        toast.error(response.error?.message || 'Failed to create stocks');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create stocks');
    },
  });
}

/**
 * Hook to update product stock
 */
export function useUpdateProductStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductStockRequest }) =>
      InventoryService.updateProductStock(id, data),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        queryClient.invalidateQueries({ queryKey: ['stock', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['product-stocks', response.data.product_id] });
        queryClient.invalidateQueries({
          queryKey: ['product-total-stock', response.data.product_id],
        });
        queryClient.invalidateQueries({ queryKey: ['product', response.data.product_id] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast.success('Stock updated successfully');
      } else {
        toast.error(response.error?.message || 'Failed to update stock');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update stock');
    },
  });
}

/**
 * Hook to delete product stock
 */
export function useDeleteProductStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InventoryService.deleteProductStock(id),
    onSuccess: (response) => {
      if (response.success && response.data) {
        queryClient.invalidateQueries({ queryKey: ['product-stocks', response.data.product_id] });
        queryClient.invalidateQueries({
          queryKey: ['product-total-stock', response.data.product_id],
        });
        queryClient.invalidateQueries({ queryKey: ['product', response.data.product_id] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast.success('Stock deleted successfully');
      } else {
        toast.error(response.error?.message || 'Failed to delete stock');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete stock');
    },
  });
}
