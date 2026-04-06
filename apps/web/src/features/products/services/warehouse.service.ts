import { apiRequest } from '@/lib/api';
import type {
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  WarehouseListQuery,
  Warehouse,
  WarehouseResponse,
  WarehouseListResponse,
  WarehouseListResponseData,
} from '../types/warehouse';

export class WarehouseService {
  /**
   * List warehouses with pagination and filters
   */
  static async list(query?: WarehouseListQuery): Promise<WarehouseListResponse> {
    const params = new URLSearchParams();
    if (query?.outlet_id) params.append('outlet_id', query.outlet_id);
    if (query?.status) params.append('status', query.status);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.per_page) params.append('per_page', query.per_page.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `warehouses?${queryString}` : 'warehouses';
    
    return apiRequest<WarehouseListResponseData>(endpoint, {
      method: 'GET',
      requireAuth: true,
    }) as Promise<WarehouseListResponse>;
  }

  /**
   * Get warehouse by ID
   */
  static async getById(id: string): Promise<WarehouseResponse> {
    return apiRequest<Warehouse>(`warehouses/${id}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  /**
   * Create a new warehouse
   */
  static async create(data: CreateWarehouseRequest): Promise<WarehouseResponse> {
    return apiRequest<Warehouse>('warehouses', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  }

  /**
   * Update an existing warehouse
   */
  static async update(
    id: string,
    data: UpdateWarehouseRequest
  ): Promise<WarehouseResponse> {
    return apiRequest<Warehouse>(`warehouses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  }

  /**
   * Delete a warehouse
   */
  static async delete(id: string): Promise<void> {
    return apiRequest<void>(`warehouses/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  }
}
