import type { ApiResponse, ApiMeta } from '@/features/auth/types';

// Category Types
export interface Category {
  id: string;
  outlet_id?: string | null;
  parent_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  sort_order: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  children?: Category[] | null; // For hierarchical display
}

// Category Request Types
export interface CreateCategoryRequest {
  name: string;
  slug?: string | null;
  description?: string | null;
  parent_id?: string | null;
  image_url?: string | null;
  sort_order?: number;
  status?: 'active' | 'inactive';
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string | null;
  description?: string | null;
  parent_id?: string | null;
  image_url?: string | null;
  sort_order?: number;
  status?: 'active' | 'inactive';
}

// Category List Query
export interface CategoryListQuery {
  page?: number;
  per_page?: number;
  search?: string;
  parent_id?: string | null; // null for root categories
  status?: 'active' | 'inactive';
  sort_by?: 'name' | 'sort_order' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// Category Response Types
export type CategoryResponse = ApiResponse<Category>;
export type CategoryListResponse = ApiResponse<Category[]> & {
  meta?: ApiMeta & {
    pagination?: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
};
