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
  private static basePaths = [
    'warehouses',
    'master-data/warehouses',
    'warehouse',
    'master-data/warehouse',
    'inventory/warehouses',
  ];

  private static emptyWarehouseListResponse(): WarehouseListResponse {
    return {
      success: true,
      data: {
        data: [],
        pagination: {
          page: 1,
          per_page: 20,
          total: 0,
          total_pages: 0,
        },
      },
      timestamp: new Date().toISOString(),
      request_id: `req_${Date.now()}`,
    };
  }

  private static isNotFoundResponse(response: {
    success: boolean;
    error?: { code?: string; message?: string };
  }): boolean {
    if (response.success) {
      return false;
    }

    const code = response.error?.code ?? '';
    const message = (response.error?.message ?? '').toLowerCase();
    return code === 'HTTP_404' || message.includes('404') || message.includes('not found');
  }

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

    let lastResponse: WarehouseListResponse | null = null;
    for (const basePath of this.basePaths) {
      const endpoint = queryString ? `${basePath}?${queryString}` : basePath;
      const response = (await apiRequest<WarehouseListResponseData>(endpoint, {
        method: 'GET',
        requireAuth: true,
      })) as WarehouseListResponse;

      if (response.success) {
        return response;
      }

      lastResponse = response;
      if (!this.isNotFoundResponse(response)) {
        return response;
      }
    }

    // Keep warehouse tab usable even when warehouse endpoint is not deployed.
    if (lastResponse && this.isNotFoundResponse(lastResponse)) {
      return this.emptyWarehouseListResponse();
    }

    return (
      lastResponse ?? {
        success: false,
        error: {
          code: 'HTTP_404',
          message: 'Warehouse endpoint not found',
        },
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}`,
      }
    );
  }

  /**
   * Get warehouse by ID
   */
  static async getById(id: string): Promise<WarehouseResponse> {
    let lastResponse: WarehouseResponse | null = null;
    for (const basePath of this.basePaths) {
      const response = await apiRequest<Warehouse>(`${basePath}/${id}`, {
        method: 'GET',
        requireAuth: true,
      });

      if (response.success) {
        return response;
      }

      lastResponse = response;
      if (!this.isNotFoundResponse(response)) {
        return response;
      }
    }

    return (
      lastResponse ?? {
        success: false,
        error: {
          code: 'HTTP_404',
          message: 'Warehouse endpoint not found',
        },
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}`,
      }
    );
  }

  /**
   * Create a new warehouse
   */
  static async create(data: CreateWarehouseRequest): Promise<WarehouseResponse> {
    let lastResponse: WarehouseResponse | null = null;
    for (const basePath of this.basePaths) {
      const response = await apiRequest<Warehouse>(basePath, {
        method: 'POST',
        body: JSON.stringify(data),
        requireAuth: true,
      });

      if (response.success) {
        return response;
      }

      lastResponse = response;
      if (!this.isNotFoundResponse(response)) {
        return response;
      }
    }

    return (
      lastResponse ?? {
        success: false,
        error: {
          code: 'HTTP_404',
          message: 'Warehouse endpoint not found',
        },
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}`,
      }
    );
  }

  /**
   * Update an existing warehouse
   */
  static async update(
    id: string,
    data: UpdateWarehouseRequest
  ): Promise<WarehouseResponse> {
    let lastResponse: WarehouseResponse | null = null;
    for (const basePath of this.basePaths) {
      const response = await apiRequest<Warehouse>(`${basePath}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        requireAuth: true,
      });

      if (response.success) {
        return response;
      }

      lastResponse = response;
      if (!this.isNotFoundResponse(response)) {
        return response;
      }
    }

    return (
      lastResponse ?? {
        success: false,
        error: {
          code: 'HTTP_404',
          message: 'Warehouse endpoint not found',
        },
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}`,
      }
    );
  }

  /**
   * Delete a warehouse
   */
  static async delete(id: string): Promise<void> {
    let lastResponse: Awaited<ReturnType<typeof apiRequest<void>>> | null = null;
    for (const basePath of this.basePaths) {
      const response = await apiRequest<void>(`${basePath}/${id}`, {
        method: 'DELETE',
        requireAuth: true,
      });

      if (response.success) {
        return;
      }

      lastResponse = response;
      if (!this.isNotFoundResponse(response)) {
        break;
      }
    }

    if (!lastResponse?.success) {
      throw new Error(lastResponse?.error?.message_en || lastResponse?.error?.message || 'Failed to delete warehouse');
    }
  }
}
