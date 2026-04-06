import type {
  Category,
  CategoryResponse,
  CategoryListResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryListQuery,
} from '../types/category';
import { apiRequest } from '@/lib/api';

/**
 * Category Service
 * Handles all category-related API calls
 */
export class CategoryService {
  /**
   * Get list of categories with pagination and filters
   */
  static async list(query?: CategoryListQuery): Promise<CategoryListResponse> {
    const params = new URLSearchParams();
    
    if (query?.page) params.append('page', query.page.toString());
    if (query?.per_page) params.append('per_page', query.per_page.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.parent_id !== undefined) {
      params.append('parent_id', query.parent_id || '');
    }
    if (query?.status) params.append('status', query.status);
    if (query?.sort_by) params.append('sort_by', query.sort_by);
    if (query?.sort_order) params.append('sort_order', query.sort_order);

    const queryString = params.toString();
    const endpoint = queryString ? `categories?${queryString}` : 'categories';

    return apiRequest<Category[]>(endpoint, {
      method: 'GET',
      requireAuth: true,
    }) as Promise<CategoryListResponse>;
  }

  /**
   * Get category by ID
   */
  static async getById(id: string): Promise<CategoryResponse> {
    return apiRequest<Category>(`categories/${id}`, {
      method: 'GET',
      requireAuth: true,
    }) as Promise<CategoryResponse>;
  }

  /**
   * Create new category
   */
  static async create(data: CreateCategoryRequest): Promise<CategoryResponse> {
    return apiRequest<Category>('categories', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    }) as Promise<CategoryResponse>;
  }

  /**
   * Update category
   */
  static async update(
    id: string,
    data: UpdateCategoryRequest
  ): Promise<CategoryResponse> {
    return apiRequest<Category>(`categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requireAuth: true,
    }) as Promise<CategoryResponse>;
  }

  /**
   * Delete category (soft delete)
   */
  static async delete(id: string): Promise<CategoryResponse> {
    return apiRequest<Category>(`categories/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    }) as Promise<CategoryResponse>;
  }
}
