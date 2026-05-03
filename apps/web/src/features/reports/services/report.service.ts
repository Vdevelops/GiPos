import { apiRequest } from '@/lib/api';
import type {
  ReportFilterQuery,
  ReportRange,
  ReportSummary,
  ReportSalesSeries,
  ReportTopProducts,
  ReportProductSales,
  ReportPaymentMethods,
  ReportConsistencyCheck,
  ReportTransaction,
  ReportSummaryResponse,
  ReportSalesResponse,
  ReportTopProductsResponse,
  ReportProductSalesResponse,
  ReportPaymentMethodsResponse,
  ReportConsistencyCheckResponse,
  ReportProductSalesQuery,
  ReportTransactionsQuery,
  ReportTransactionsResponse,
  ReportTransactionResponse,
  UpdateReportTransactionRequest,
  UpdateReportTransactionResponse,
  CreateReportTransactionRequest,
  CreateReportTransactionResponse,
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

  static async getProductSales(
    query?: ReportProductSalesQuery
  ): Promise<ReportProductSalesResponse> {
    return apiRequest<ReportProductSales>(
      `reports/product-sales${toQueryString(query)}`,
      {
        method: 'GET',
        requireAuth: true,
      }
    ) as Promise<ReportProductSalesResponse>;
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

  static async updateTransactionById(
    id: string,
    payload: UpdateReportTransactionRequest
  ): Promise<UpdateReportTransactionResponse> {
    return apiRequest<ReportTransaction>(`sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      requireAuth: true,
    }) as Promise<UpdateReportTransactionResponse>;
  }

  static async createTransaction(
    payload: CreateReportTransactionRequest
  ): Promise<CreateReportTransactionResponse> {
    const saleResponse = await apiRequest<any>('sales', {
      method: 'POST',
      body: JSON.stringify({
        outlet_id: payload.outlet_id,
        payment_method: payload.payment_method,
        notes: payload.notes,
        items: payload.items,
        occurred_at: payload.occurred_at,
      }),
      requireAuth: true,
    }) as any;

    if (!saleResponse?.success || !saleResponse.data?.id) {
      return saleResponse as CreateReportTransactionResponse;
    }

    const sale = saleResponse.data;
    const paymentBody = {
      sale_id: sale.id,
      method: payload.payment_method,
      amount: sale.total,
      amount_paid: payload.payment_method === 'cash' ? sale.total : undefined,
      paid_at: payload.occurred_at,
    };

    const paymentResponse = await apiRequest<any>('payments', {
      method: 'POST',
      body: JSON.stringify(paymentBody),
      requireAuth: true,
    }) as any;

    if (!paymentResponse?.success) {
      await apiRequest<null>(`sales/${sale.id}/void`, {
        method: 'POST',
        requireAuth: true,
      });
      return paymentResponse as CreateReportTransactionResponse;
    }

    return apiRequest<ReportTransaction>(`sales/${sale.id}`, {
      method: 'GET',
      requireAuth: true,
    }) as Promise<CreateReportTransactionResponse>;
  }

  static async voidTransaction(id: string): Promise<import('@/features/auth/types').ApiResponse<null>> {
    return apiRequest<null>(`sales/${id}/void`, {
      method: 'POST',
      requireAuth: true,
    });
  }
}
