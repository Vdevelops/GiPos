import type {
  Sale,
  SaleResponse,
  SaleListResponse,
  CreateSaleRequest,
  UpdateSaleRequest,
  SaleListQuery,
} from '../types';
import type { ApiResponse } from '@/features/auth/types';
import { apiRequest } from '@/lib/api';

/**
 * Sale Service
 * Handles all sale/transaction-related API calls
 */
export class SaleService {
  /**
   * Get list of sales with pagination and filters
   */
  static async list(query?: SaleListQuery): Promise<SaleListResponse> {
    const params = new URLSearchParams();
    
    if (query?.page) params.append('page', query.page.toString());
    if (query?.per_page) params.append('per_page', query.per_page.toString());
    if (query?.outlet_id) params.append('outlet_id', query.outlet_id);
    if (query?.shift_id) params.append('shift_id', query.shift_id);
    if (query?.customer_id) params.append('customer_id', query.customer_id);
    if (query?.status) params.append('status', query.status);
    if (query?.payment_status) params.append('payment_status', query.payment_status);
    if (query?.payment_method) params.append('payment_method', query.payment_method);
    if (query?.start_date) params.append('start_date', query.start_date);
    if (query?.end_date) params.append('end_date', query.end_date);
    if (query?.search) params.append('search', query.search);
    if (query?.sort_by) params.append('sort_by', query.sort_by);
    if (query?.sort_order) params.append('sort_order', query.sort_order);

    const queryString = params.toString();
    const endpoint = queryString ? `sales?${queryString}` : 'sales';

    return apiRequest<Sale[]>(endpoint, {
      method: 'GET',
      requireAuth: true,
    }) as Promise<SaleListResponse>;
  }

  /**
   * Get sale by ID
   */
  static async getById(id: string): Promise<SaleResponse> {
    return apiRequest<Sale>(`sales/${id}`, {
      method: 'GET',
      requireAuth: true,
    }) as Promise<SaleResponse>;
  }

  /**
   * Create new sale
   */
  static async create(data: CreateSaleRequest): Promise<SaleResponse> {
    return apiRequest<Sale>('sales', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    }) as Promise<SaleResponse>;
  }

  /**
   * Update sale (for void/refund)
   */
  static async update(
    id: string,
    data: UpdateSaleRequest
  ): Promise<SaleResponse> {
    return apiRequest<Sale>(`sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requireAuth: true,
    }) as Promise<SaleResponse>;
  }

  /**
   * Void sale (before payment)
   */
  static async void(id: string, notes?: string): Promise<ApiResponse<null>> {
    return apiRequest<null>(`sales/${id}/void`, {
      method: 'POST',
      body: JSON.stringify({ notes: notes || null }),
      requireAuth: true,
    });
  }
}
