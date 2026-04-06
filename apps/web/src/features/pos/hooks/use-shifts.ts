'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShiftService } from '../services/shift.service';
import type {
  Shift,
  ShiftListQuery,
  CreateShiftRequest,
  CloseShiftRequest,
} from '../types/shift';
import { toast } from '@/lib/toast';

/**
 * Hook to get list of shifts
 */
export function useShifts(query?: ShiftListQuery) {
  return useQuery({
    queryKey: ['shifts', query],
    queryFn: () => ShiftService.list(query),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to get shift by ID
 */
export function useShift(id: string | null) {
  return useQuery({
    queryKey: ['shift', id],
    queryFn: () => {
      if (!id) throw new Error('Shift ID is required');
      return ShiftService.getById(id);
    },
    enabled: !!id,
  });
}

/**
 * Hook to open shift
 */
export function useOpenShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShiftRequest) => ShiftService.open(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['shifts'] });
        toast.success('Shift opened successfully');
      } else {
        toast.error(response.error?.message || 'Failed to open shift');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to open shift');
    },
  });
}

/**
 * Hook to close shift
 */
export function useCloseShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CloseShiftRequest }) =>
      ShiftService.close(id, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['shifts'] });
        queryClient.invalidateQueries({ queryKey: ['shift', variables.id] });
        toast.success('Shift closed successfully');
      } else {
        toast.error(response.error?.message || 'Failed to close shift');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to close shift');
    },
  });
}
