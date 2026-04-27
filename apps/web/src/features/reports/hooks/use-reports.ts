'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ReportService } from '../services/report.service';
import type {
  ReportFilterQuery,
  ReportProductSalesQuery,
  ReportRange,
  ReportTransactionsQuery,
  UpdateReportTransactionRequest,
} from '../types/report';
import { toast } from '@/lib/toast';

const REPORT_QUERY_BEHAVIOR = {
  refetchOnMount: 'always' as const,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  staleTime: 0,
};

export function useReportSummary(query?: ReportFilterQuery) {
  return useQuery({
    queryKey: ['reports', 'summary', query],
    queryFn: () => ReportService.getSummary(query),
    ...REPORT_QUERY_BEHAVIOR,
  });
}

export function useReportSales(range: ReportRange, query?: ReportFilterQuery) {
  return useQuery({
    queryKey: ['reports', 'sales', range, query],
    queryFn: () => ReportService.getSales(range, query),
    ...REPORT_QUERY_BEHAVIOR,
  });
}

export function useReportTopProducts(limit = 10, query?: ReportFilterQuery) {
  return useQuery({
    queryKey: ['reports', 'top-products', limit, query],
    queryFn: () => ReportService.getTopProducts(limit, query),
    ...REPORT_QUERY_BEHAVIOR,
  });
}

export function useReportPaymentMethods(query?: ReportFilterQuery) {
  return useQuery({
    queryKey: ['reports', 'payment-methods', query],
    queryFn: () => ReportService.getPaymentMethods(query),
    ...REPORT_QUERY_BEHAVIOR,
  });
}

export function useReportProductSales(query?: ReportProductSalesQuery) {
  return useQuery({
    queryKey: ['reports', 'product-sales', query],
    queryFn: () => ReportService.getProductSales(query),
    ...REPORT_QUERY_BEHAVIOR,
  });
}

export function useReportConsistencyCheck(limit = 20, query?: ReportFilterQuery) {
  return useQuery({
    queryKey: ['reports', 'consistency-check', limit, query],
    queryFn: () => ReportService.getConsistencyCheck(limit, query),
    ...REPORT_QUERY_BEHAVIOR,
  });
}

export function useReportTransactions(query?: ReportTransactionsQuery) {
  return useQuery({
    queryKey: ['reports', 'transactions', query],
    queryFn: () => ReportService.getTransactions(query),
    ...REPORT_QUERY_BEHAVIOR,
  });
}

export function useReportTransaction(transactionID: string | null) {
  return useQuery({
    queryKey: ['reports', 'transaction', transactionID],
    queryFn: () => {
      if (!transactionID) throw new Error('Transaction ID is required');
      return ReportService.getTransactionById(transactionID);
    },
    enabled: !!transactionID,
    ...REPORT_QUERY_BEHAVIOR,
  });
}

export function useUpdateReportTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateReportTransactionRequest }) =>
      ReportService.updateTransactionById(id, payload),
    onSuccess: (response, variables) => {
      if (!response.success) {
        toast.error(response.error?.message || 'Gagal memperbarui transaksi');
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['reports', 'transaction', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Transaksi berhasil diperbarui');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui transaksi');
    },
  });
}
