import type { ApiResponse, ApiMeta } from '@/features/auth/types';

// Product Types
export interface Product {
  id: string;
  outlet_id?: string | null;
  outlet?: ProductOutlet | null;
  category_id?: string | null;
  category?: ProductCategory | null;
  name: string;
  sku: string;
  barcode?: string | null;
  description?: string | null;
  price: number; // in sen (integer)
  cost?: number | null; // in sen (integer)
  taxable: boolean;
  track_stock: boolean;
  status: 'active' | 'inactive' | 'archived';
  stocks?: ProductStock[] | null;
  images?: ProductImage[] | null;
  created_at: string;
  updated_at: string;
}

export interface ProductOutlet {
  id: string;
  code: string;
  name: string;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface ProductStock {
  warehouse_id: string;
  warehouse?: ProductWarehouse | null;
  quantity: number;
  reserved: number;
  min_stock?: number | null;
  max_stock?: number | null;
}

export interface ProductWarehouse {
  id: string;
  code: string;
  name: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  thumbnail_url?: string | null;
  order: number;
  alt?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  mime_type?: string | null;
  created_at: string;
  updated_at: string;
}

// Product Request Types
export interface CreateProductRequest {
  name: string;
  sku: string;
  barcode?: string | null;
  description?: string | null;
  price: number; // in sen
  cost?: number | null; // in sen
  category_id?: string | null;
  taxable?: boolean;
  track_stock?: boolean;
  status?: 'active' | 'inactive' | 'archived';
}

export interface UpdateProductRequest {
  name?: string;
  barcode?: string | null;
  description?: string | null;
  price?: number; // in sen
  cost?: number | null; // in sen
  category_id?: string | null;
  taxable?: boolean;
  track_stock?: boolean;
  status?: 'active' | 'inactive' | 'archived';
}

// Product List Query
export interface ProductListQuery {
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: string;
  status?: 'active' | 'inactive' | 'archived';
  min_price?: number;
  max_price?: number;
  sort_by?: 'name' | 'price' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

// Product Response Types
export type ProductResponse = ApiResponse<Product>;
export type ProductListResponse = ApiResponse<Product[]> & {
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
