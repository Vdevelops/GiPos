'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentService } from '../services/payment.service';
import type {
  Payment,
  ProcessPaymentRequest,
  UpdatePaymentRequest,
} from '../types';
import { toast } from '@/lib/toast';

/**
 * Hook to get payment by ID
 */
export function usePayment(id: string | null) {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: () => {
      if (!id) throw new Error('Payment ID is required');
      return PaymentService.getById(id);
    },
    enabled: !!id,
  });
}

/**
 * Hook to get payment by sale ID
 */
export function usePaymentBySaleId(saleId: string | null) {
  return useQuery({
    queryKey: ['payment', 'sale', saleId],
    queryFn: () => {
      if (!saleId) throw new Error('Sale ID is required');
      return PaymentService.getBySaleId(saleId);
    },
    enabled: !!saleId,
  });
}

/**
 * Hook to process payment
 */
export function useProcessPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProcessPaymentRequest) => PaymentService.process(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        queryClient.invalidateQueries({ queryKey: ['payment', 'sale', response.data.sale_id] });
        queryClient.invalidateQueries({ queryKey: ['sales'] });
        queryClient.invalidateQueries({ queryKey: ['sale', response.data.sale_id] });
        toast.success('Payment processed successfully');
      } else {
        toast.error(response.error?.message || 'Failed to process payment');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to process payment');
    },
  });
}

/**
 * Hook to update payment status
 */
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentRequest }) =>
      PaymentService.updateStatus(id, data),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        queryClient.invalidateQueries({ queryKey: ['payment', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['payment', 'sale', response.data.sale_id] });
        queryClient.invalidateQueries({ queryKey: ['sales'] });
        queryClient.invalidateQueries({ queryKey: ['sale', response.data.sale_id] });
        toast.success('Payment status updated successfully');
      } else {
        toast.error(response.error?.message || 'Failed to update payment status');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update payment status');
    },
  });
}
