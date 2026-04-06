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
  /**
   * Get stocks for a product
   */
  static async getProductStocks(productId: string): Promise<ProductStockListResponse> {
    return apiRequest<ProductStock[]>(`products/${productId}/stocks`, {
      method: 'GET',
      requireAuth: true,
    }) as Promise<ProductStockListResponse>;
  }

  /**
   * Get total stock for a product
   */
  static async getProductTotalStock(productId: string): Promise<ProductTotalStockResponse> {
    return apiRequest<{ total_quantity: number; total_reserved: number; available: number }>(
      `products/${productId}/stocks/total`,
      {
        method: 'GET',
        requireAuth: true,
      }
    ) as Promise<ProductTotalStockResponse>;
  }

  /**
   * Get stock by ID
   */
  static async getStockById(id: string): Promise<ProductStockResponse> {
    return apiRequest<ProductStock>(`products/stocks/${id}`, {
      method: 'GET',
      requireAuth: true,
    }) as Promise<ProductStockResponse>;
  }

  /**
   * Create product stock
   */
  static async createProductStock(
    productId: string,
    data: CreateProductStockRequest
  ): Promise<ProductStockResponse> {
    return apiRequest<ProductStock>(`products/${productId}/stocks`, {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    }) as Promise<ProductStockResponse>;
  }

  /**
   * Bulk create product stocks
   */
  static async bulkCreateProductStocks(
    productId: string,
    data: BulkCreateProductStockRequest
  ): Promise<ProductStockListResponse> {
    return apiRequest<ProductStock[]>(`products/${productId}/stocks/bulk`, {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    }) as Promise<ProductStockListResponse>;
  }

  /**
   * Update product stock
   */
  static async updateProductStock(
    id: string,
    data: UpdateProductStockRequest
  ): Promise<ProductStockResponse> {
    return apiRequest<ProductStock>(`products/stocks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requireAuth: true,
    }) as Promise<ProductStockResponse>;
  }

  /**
   * Delete product stock
   */
  static async deleteProductStock(id: string): Promise<ProductStockResponse> {
    return apiRequest<ProductStock>(`products/stocks/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    }) as Promise<ProductStockResponse>;
  }
}
