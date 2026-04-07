import { apiRequest } from '@/lib/api';
import type {
  ReportFilterQuery,
  ReportRange,
  ReportSummary,
  ReportSalesSeries,
  ReportTopProducts,
  ReportPaymentMethods,
  ReportConsistencyCheck,
  ReportTransaction,
  ReportSummaryResponse,
  ReportSalesResponse,
  ReportTopProductsResponse,
  ReportPaymentMethodsResponse,
  ReportConsistencyCheckResponse,
  ReportTransactionsQuery,
  ReportTransactionsResponse,
  ReportTransactionResponse,
} from '../types/report';

function toQueryString(
  query?: Record<string, string | number | undefined | null> | ReportFilterQuery
): string {
  const params = new URLSearchParams();
  if (!query) {
    return '';
  }

  Object.entries(query as Record<string, string | number | undefined | null>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      params.append(key, String(value));
    }
  });

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export class ReportService {
  static async getSummary(query?: ReportFilterQuery): Promise<ReportSummaryResponse> {
    return apiRequest<ReportSummary>(`reports/summary${toQueryString(query)}`, {
      method: 'GET',
      requireAuth: true,
    }) as Promise<ReportSummaryResponse>;
  }

  static async getSales(
    range: ReportRange,
    query?: ReportFilterQuery
  ): Promise<ReportSalesResponse> {
    return apiRequest<ReportSalesSeries>(
      `reports/sales${toQueryString({ range, ...query })}`,
      {
        method: 'GET',
        requireAuth: true,
      }
    ) as Promise<ReportSalesResponse>;
  }

  static async getTopProducts(
    limit = 10,
    query?: ReportFilterQuery
  ): Promise<ReportTopProductsResponse> {
    return apiRequest<ReportTopProducts>(
      `reports/top-products${toQueryString({ limit, ...query })}`,
      {
        method: 'GET',
        requireAuth: true,
      }
    ) as Promise<ReportTopProductsResponse>;
  }

  static async getPaymentMethods(
    query?: ReportFilterQuery
  ): Promise<ReportPaymentMethodsResponse> {
    return apiRequest<ReportPaymentMethods>(
      `reports/payment-methods${toQueryString(query)}`,
      {
        method: 'GET',
        requireAuth: true,
      }
    ) as Promise<ReportPaymentMethodsResponse>;
  }

  static async getConsistencyCheck(
    limit = 20,
    query?: ReportFilterQuery
  ): Promise<ReportConsistencyCheckResponse> {
    return apiRequest<ReportConsistencyCheck>(
      `reports/consistency-check${toQueryString({ limit, ...query })}`,
      {
        method: 'GET',
        requireAuth: true,
      }
    ) as Promise<ReportConsistencyCheckResponse>;
  }

  static async getTransactions(
    query?: ReportTransactionsQuery
  ): Promise<ReportTransactionsResponse> {
    return apiRequest<ReportTransaction[]>(`sales${toQueryString(query)}`, {
      method: 'GET',
      requireAuth: true,
    }) as Promise<ReportTransactionsResponse>;
  }

  static async getTransactionById(id: string): Promise<ReportTransactionResponse> {
    return apiRequest<ReportTransaction>(`sales/${id}`, {
      method: 'GET',
      requireAuth: true,
    }) as Promise<ReportTransactionResponse>;
  }
}
