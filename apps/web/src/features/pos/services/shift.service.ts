import type {
  Shift,
  ShiftResponse,
  ShiftListResponse,
  CreateShiftRequest,
  CloseShiftRequest,
  ShiftListQuery,
} from '../types/shift';
import { apiRequest } from '@/lib/api';

/**
 * Shift Service
 * Handles all shift-related API calls
 */
export class ShiftService {
  /**
   * Get list of shifts with pagination and filters
   */
  static async list(query?: ShiftListQuery): Promise<ShiftListResponse> {
    const params = new URLSearchParams();
    
    if (query?.page) params.append('page', query.page.toString());
    if (query?.per_page) params.append('per_page', query.per_page.toString());
    if (query?.outlet_id) params.append('outlet_id', query.outlet_id);
    if (query?.user_id) params.append('user_id', query.user_id);
    if (query?.status) params.append('status', query.status);
    if (query?.start_date) params.append('start_date', query.start_date);
    if (query?.end_date) params.append('end_date', query.end_date);
    if (query?.sort_by) params.append('sort_by', query.sort_by);
    if (query?.sort_order) params.append('sort_order', query.sort_order);

    const queryString = params.toString();
    const endpoint = queryString ? `shifts?${queryString}` : 'shifts';

    return apiRequest<Shift[]>(endpoint, {
      method: 'GET',
      requireAuth: true,
    }) as Promise<ShiftListResponse>;
  }

  /**
   * Get shift by ID
   */
  static async getById(id: string): Promise<ShiftResponse> {
    return apiRequest<Shift>(`shifts/${id}`, {
      method: 'GET',
      requireAuth: true,
    }) as Promise<ShiftResponse>;
  }

  /**
   * Open a new shift
   */
  static async open(data: CreateShiftRequest): Promise<ShiftResponse> {
    return apiRequest<Shift>('shifts/open', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    }) as Promise<ShiftResponse>;
  }

  /**
   * Close a shift
   */
  static async close(
    id: string,
    data: CloseShiftRequest
  ): Promise<ShiftResponse> {
    return apiRequest<Shift>(`shifts/${id}/close`, {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    }) as Promise<ShiftResponse>;
  }
}
