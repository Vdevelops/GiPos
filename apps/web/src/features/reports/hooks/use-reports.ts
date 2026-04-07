'use client';

import { useQuery } from '@tanstack/react-query';
import { ReportService } from '../services/report.service';
import type { ReportFilterQuery, ReportRange, ReportTransactionsQuery } from '../types/report';

const REPORT_REFETCH_INTERVAL = 8_000;

export function useReportSummary(query?: ReportFilterQuery) {
  return useQuery({
    queryKey: ['reports', 'summary', query],
    queryFn: () => ReportService.getSummary(query),
    refetchInterval: REPORT_REFETCH_INTERVAL,
    staleTime: 5_000,
  });
}

export function useReportSales(range: ReportRange, query?: ReportFilterQuery) {
  return useQuery({
    queryKey: ['reports', 'sales', range, query],
    queryFn: () => ReportService.getSales(range, query),
    refetchInterval: REPORT_REFETCH_INTERVAL,
    staleTime: 5_000,
  });
}

export function useReportTopProducts(limit = 10, query?: ReportFilterQuery) {
  return useQuery({
    queryKey: ['reports', 'top-products', limit, query],
    queryFn: () => ReportService.getTopProducts(limit, query),
    refetchInterval: REPORT_REFETCH_INTERVAL,
    staleTime: 5_000,
  });
}

export function useReportPaymentMethods(query?: ReportFilterQuery) {
  return useQuery({
    queryKey: ['reports', 'payment-methods', query],
    queryFn: () => ReportService.getPaymentMethods(query),
    refetchInterval: REPORT_REFETCH_INTERVAL,
    staleTime: 5_000,
  });
}

export function useReportConsistencyCheck(limit = 20, query?: ReportFilterQuery) {
  return useQuery({
    queryKey: ['reports', 'consistency-check', limit, query],
    queryFn: () => ReportService.getConsistencyCheck(limit, query),
    refetchInterval: REPORT_REFETCH_INTERVAL,
    staleTime: 5_000,
  });
}

export function useReportTransactions(query?: ReportTransactionsQuery) {
  return useQuery({
    queryKey: ['reports', 'transactions', query],
    queryFn: () => ReportService.getTransactions(query),
    refetchInterval: 30_000,
    staleTime: 10_000,
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
  });
}
