'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { WarehouseService } from '../services/warehouse.service';
import type {
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  WarehouseListQuery,
} from '../types/warehouse';

// Query keys
const warehouseKeys = {
  all: ['warehouses'] as const,
  lists: () => [...warehouseKeys.all, 'list'] as const,
  list: (query?: WarehouseListQuery) => [...warehouseKeys.lists(), query] as const,
  details: () => [...warehouseKeys.all, 'detail'] as const,
  detail: (id: string) => [...warehouseKeys.details(), id] as const,
};

/**
 * Hook to fetch list of warehouses
 */
export function useWarehouses(query?: WarehouseListQuery) {
  return useQuery({
    queryKey: warehouseKeys.list(query),
    queryFn: async () => {
      const response = await WarehouseService.list(query);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message_en || 'Failed to fetch warehouses');
      }
      return response.data;
    },
  });
}

/**
 * Hook to fetch a single warehouse by ID
 */
export function useWarehouse(id: string | null) {
  return useQuery({
    queryKey: warehouseKeys.detail(id ?? ''),
    queryFn: async () => {
      if (!id) return null;
      const response = await WarehouseService.getById(id);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message_en || 'Failed to fetch warehouse');
      }
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new warehouse
 */
export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWarehouseRequest) => {
      const response = await WarehouseService.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message_en || 'Failed to create warehouse');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
      toast.success('Warehouse created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create warehouse');
    },
  });
}

/**
 * Hook to update an existing warehouse
 */
export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateWarehouseRequest;
    }) => {
      const response = await WarehouseService.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message_en || 'Failed to update warehouse');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: warehouseKeys.detail(variables.id) });
      toast.success('Warehouse updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update warehouse');
    },
  });
}

/**
 * Hook to delete a warehouse
 */
export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await WarehouseService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
      toast.success('Warehouse deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete warehouse');
    },
  });
}
