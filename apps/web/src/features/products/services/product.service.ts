import type {
  Product,
  ProductResponse,
  ProductListResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListQuery,
} from '../types';
import { apiRequest } from '@/lib/api';

/**
 * Product Service
 * Handles all product-related API calls
 */
export class ProductService {
  /**
   * Get list of products with pagination and filters
   */
  static async list(query?: ProductListQuery): Promise<ProductListResponse> {
    const params = new URLSearchParams();
    
    if (query?.page) params.append('page', query.page.toString());
    if (query?.per_page) params.append('per_page', query.per_page.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.category_id) params.append('category_id', query.category_id);
    if (query?.status) params.append('status', query.status);
    if (query?.min_price) params.append('min_price', query.min_price.toString());
    if (query?.max_price) params.append('max_price', query.max_price.toString());
    if (query?.sort_by) params.append('sort_by', query.sort_by);
    if (query?.sort_order) params.append('sort_order', query.sort_order);

    const queryString = params.toString();
    const endpoint = queryString ? `products?${queryString}` : 'products';

    return apiRequest<Product[]>(endpoint, {
      method: 'GET',
      requireAuth: true,
    }) as Promise<ProductListResponse>;
  }

  /**
   * Get product by ID
   */
  static async getById(id: string): Promise<ProductResponse> {
    return apiRequest<Product>(`products/${id}`, {
      method: 'GET',
      requireAuth: true,
    }) as Promise<ProductResponse>;
  }

  /**
   * Get product by SKU
   */
  static async getBySKU(sku: string): Promise<ProductResponse> {
    return apiRequest<Product>(`products/sku/${sku}`, {
      method: 'GET',
      requireAuth: true,
    }) as Promise<ProductResponse>;
  }

  /**
   * Get product by barcode
   */
  static async getByBarcode(barcode: string): Promise<ProductResponse> {
    return apiRequest<Product>(`products/barcode/${barcode}`, {
      method: 'GET',
      requireAuth: true,
    }) as Promise<ProductResponse>;
  }

  /**
   * Create new product
   */
  static async create(data: CreateProductRequest): Promise<ProductResponse> {
    return apiRequest<Product>('products', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    }) as Promise<ProductResponse>;
  }

  /**
   * Update product
   */
  static async update(
    id: string,
    data: UpdateProductRequest
  ): Promise<ProductResponse> {
    return apiRequest<Product>(`products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requireAuth: true,
    }) as Promise<ProductResponse>;
  }

  /**
   * Delete product (soft delete)
   */
  static async delete(id: string): Promise<ProductResponse> {
    return apiRequest<Product>(`products/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    }) as Promise<ProductResponse>;
  }
}
