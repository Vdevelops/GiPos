import type {
  ProductStock,
  ProductStockResponse,
  ProductStockListResponse,
  ProductTotalStockResponse,
  CreateProductStockRequest,
  UpdateProductStockRequest,
  BulkCreateProductStockRequest,
} from '../types/inventory';
import { apiRequest } from '@/lib/api';

/**
 * Inventory Service
 * Handles all inventory/stock-related API calls
 */
export class InventoryService {
  private static productStockPaths(productId: string): string[] {
    return [
      `products/${productId}/stocks`,
      `products/${productId}/stock`,
      `product/${productId}/stocks`,
      `master-data/products/${productId}/stocks`,
    ];
  }

  private static stockByIDPaths(id: string): string[] {
    return [
      `products/stocks/${id}`,
      `products/stock/${id}`,
      `stocks/${id}`,
      `product-stocks/${id}`,
      `master-data/products/stocks/${id}`,
    ];
  }

  private static flatStockPaths(): string[] {
    return ['stocks', 'product-stocks', 'inventory/stocks'];
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
   * Get stocks for a product
   */
  static async getProductStocks(productId: string): Promise<ProductStockListResponse> {
    let lastResponse: ProductStockListResponse | null = null;

    for (const endpoint of this.productStockPaths(productId)) {
      const response = (await apiRequest<ProductStock[]>(endpoint, {
        method: 'GET',
        requireAuth: true,
      })) as ProductStockListResponse;

      if (response.success) {
        return response;
      }

      lastResponse = response;
      if (!this.isNotFoundResponse(response)) {
        return response;
      }
    }

    const legacyListResponse = (await apiRequest<ProductStock[]>(
      `products/stocks?product_id=${encodeURIComponent(productId)}`,
      {
        method: 'GET',
        requireAuth: true,
      }
    )) as ProductStockListResponse;

    if (legacyListResponse.success || !this.isNotFoundResponse(legacyListResponse)) {
      return legacyListResponse;
    }

    lastResponse = legacyListResponse;

    for (const endpoint of this.flatStockPaths()) {
      const flatResponse = (await apiRequest<ProductStock[]>(
        `${endpoint}?product_id=${encodeURIComponent(productId)}`,
        {
          method: 'GET',
          requireAuth: true,
        }
      )) as ProductStockListResponse;

      if (flatResponse.success || !this.isNotFoundResponse(flatResponse)) {
        return flatResponse;
      }

      lastResponse = flatResponse;
    }

    return (
      lastResponse ?? {
        success: false,
        error: {
          code: 'HTTP_404',
          message: 'Product stock endpoint not found',
        },
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}`,
      }
    );
  }

  /**
   * Get total stock for a product
   */
  static async getProductTotalStock(productId: string): Promise<ProductTotalStockResponse> {
    let lastResponse: ProductTotalStockResponse | null = null;

    for (const baseEndpoint of this.productStockPaths(productId)) {
      const response = (await apiRequest<{ total_quantity: number; total_reserved: number; available: number }>(
        `${baseEndpoint}/total`,
        {
          method: 'GET',
          requireAuth: true,
        }
      )) as ProductTotalStockResponse;

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
          message: 'Product total stock endpoint not found',
        },
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}`,
      }
    );
  }

  /**
   * Get stock by ID
   */
  static async getStockById(id: string): Promise<ProductStockResponse> {
    let lastResponse: ProductStockResponse | null = null;

    for (const endpoint of this.stockByIDPaths(id)) {
      const response = (await apiRequest<ProductStock>(endpoint, {
        method: 'GET',
        requireAuth: true,
      })) as ProductStockResponse;

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
          message: 'Stock endpoint not found',
        },
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}`,
      }
    );
  }

  /**
   * Create product stock
   */
  static async createProductStock(
    productId: string,
    data: CreateProductStockRequest
  ): Promise<ProductStockResponse> {
    let lastResponse: ProductStockResponse | null = null;

    for (const endpoint of this.productStockPaths(productId)) {
      const response = (await apiRequest<ProductStock>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        requireAuth: true,
      })) as ProductStockResponse;

      if (response.success) {
        return response;
      }

      lastResponse = response;
      if (!this.isNotFoundResponse(response)) {
        return response;
      }
    }

    const legacyCreateResponse = (await apiRequest<ProductStock>('products/stocks', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        ...data,
      }),
      requireAuth: true,
    })) as ProductStockResponse;

    if (legacyCreateResponse.success || !this.isNotFoundResponse(legacyCreateResponse)) {
      return legacyCreateResponse;
    }

    lastResponse = legacyCreateResponse;

    for (const endpoint of this.flatStockPaths()) {
      const flatCreateResponse = (await apiRequest<ProductStock>(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          ...data,
        }),
        requireAuth: true,
      })) as ProductStockResponse;

      if (flatCreateResponse.success || !this.isNotFoundResponse(flatCreateResponse)) {
        return flatCreateResponse;
      }

      lastResponse = flatCreateResponse;
    }

    return (
      lastResponse ?? {
        success: false,
        error: {
          code: 'HTTP_404',
          message: 'Create stock endpoint not found',
        },
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}`,
      }
    );
  }

  /**
   * Bulk create product stocks
   */
  static async bulkCreateProductStocks(
    productId: string,
    data: BulkCreateProductStockRequest
  ): Promise<ProductStockListResponse> {
    let lastResponse: ProductStockListResponse | null = null;

    for (const baseEndpoint of this.productStockPaths(productId)) {
      const response = (await apiRequest<ProductStock[]>(`${baseEndpoint}/bulk`, {
        method: 'POST',
        body: JSON.stringify(data),
        requireAuth: true,
      })) as ProductStockListResponse;

      if (response.success) {
        return response;
      }

      lastResponse = response;
      if (!this.isNotFoundResponse(response)) {
        return response;
      }
    }

    const legacyBulkCreateResponse = (await apiRequest<ProductStock[]>('products/stocks/bulk', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        ...data,
      }),
      requireAuth: true,
    })) as ProductStockListResponse;

    if (legacyBulkCreateResponse.success || !this.isNotFoundResponse(legacyBulkCreateResponse)) {
      return legacyBulkCreateResponse;
    }

    lastResponse = legacyBulkCreateResponse;

    for (const endpoint of this.flatStockPaths()) {
      const flatBulkCreateResponse = (await apiRequest<ProductStock[]>(`${endpoint}/bulk`, {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          ...data,
        }),
        requireAuth: true,
      })) as ProductStockListResponse;

      if (flatBulkCreateResponse.success || !this.isNotFoundResponse(flatBulkCreateResponse)) {
        return flatBulkCreateResponse;
      }

      lastResponse = flatBulkCreateResponse;
    }

    return (
      lastResponse ?? {
        success: false,
        error: {
          code: 'HTTP_404',
          message: 'Bulk create stock endpoint not found',
        },
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}`,
      }
    );
  }

  /**
   * Update product stock
   */
  static async updateProductStock(
    id: string,
    data: UpdateProductStockRequest
  ): Promise<ProductStockResponse> {
    let lastResponse: ProductStockResponse | null = null;

    for (const endpoint of this.stockByIDPaths(id)) {
      const response = (await apiRequest<ProductStock>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
        requireAuth: true,
      })) as ProductStockResponse;

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
          message: 'Update stock endpoint not found',
        },
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}`,
      }
    );
  }

  /**
   * Delete product stock
   */
  static async deleteProductStock(id: string): Promise<ProductStockResponse> {
    let lastResponse: ProductStockResponse | null = null;

    for (const endpoint of this.stockByIDPaths(id)) {
      const response = (await apiRequest<ProductStock>(endpoint, {
        method: 'DELETE',
        requireAuth: true,
      })) as ProductStockResponse;

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
          message: 'Delete stock endpoint not found',
        },
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}`,
      }
    );
  }
}
