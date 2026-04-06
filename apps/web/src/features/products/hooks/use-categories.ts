'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoryService } from '../services/category.service';
import type {
  Category,
  CategoryListQuery,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/category';
import { toast } from '@/lib/toast';

/**
 * Hook to get list of categories
 */
export function useCategories(query?: CategoryListQuery) {
  return useQuery({
    queryKey: ['categories', query],
    queryFn: () => CategoryService.list(query),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get category by ID
 */
export function useCategory(id: string | null) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => {
      if (!id) throw new Error('Category ID is required');
      return CategoryService.getById(id);
    },
    enabled: !!id,
  });
}

/**
 * Hook to create category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => CategoryService.create(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        toast.success('Category created successfully');
      } else {
        toast.error(response.error?.message || 'Failed to create category');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create category');
    },
  });
}

/**
 * Hook to update category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      CategoryService.update(id, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        queryClient.invalidateQueries({ queryKey: ['category', variables.id] });
        toast.success('Category updated successfully');
      } else {
        toast.error(response.error?.message || 'Failed to update category');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update category');
    },
  });
}

/**
 * Hook to delete category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CategoryService.delete(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        toast.success('Category deleted successfully');
      } else {
        toast.error(response.error?.message || 'Failed to delete category');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete category');
    },
  });
}
