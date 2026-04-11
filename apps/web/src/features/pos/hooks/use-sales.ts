'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SaleService } from '../services/sale.service';
import type {
  Sale,
  SaleListQuery,
  CreateSaleRequest,
  UpdateSaleRequest,
} from '../types';
import { toast } from '@/lib/toast';

/**
 * Hook to get list of sales
 */
export function useSales(query?: SaleListQuery) {
  return useQuery({
    queryKey: ['sales', query],
    queryFn: () => SaleService.list(query),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to get sale by ID
 */
export function useSale(id: string | null) {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: () => {
      if (!id) throw new Error('Sale ID is required');
      return SaleService.getById(id);
    },
    enabled: !!id,
  });
}

/**
 * Hook to create sale
 */
export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSaleRequest) => SaleService.create(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['sales'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['product-stocks'] });
        queryClient.invalidateQueries({ queryKey: ['product-total-stock'] });
        toast.success('Sale created successfully');
      } else {
        toast.error(response.error?.message || 'Failed to create sale');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create sale');
    },
  });
}

/**
 * Hook to void sale
 */
export function useVoidSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      SaleService.void(id, notes),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['sales'] });
        queryClient.invalidateQueries({ queryKey: ['sale', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['product-stocks'] });
        queryClient.invalidateQueries({ queryKey: ['product-total-stock'] });
        toast.success('Sale voided successfully');
      } else {
        toast.error(response.error?.message || 'Failed to void sale');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to void sale');
    },
  });
}
