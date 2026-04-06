import type { ApiResponse, ApiMeta } from '@/features/auth/types';

// Product Stock Types
export interface ProductStock {
  id: string;
  product_id: string;
  warehouse_id: string;
  warehouse?: Warehouse | null;
  quantity: number;
  reserved: number;
  min_stock: number;
  max_stock: number;
  last_updated?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
}

// Product Stock Request Types
export interface CreateProductStockRequest {
  warehouse_id: string;
  quantity: number;
  reserved?: number;
  min_stock?: number;
  max_stock?: number;
}

export interface UpdateProductStockRequest {
  quantity?: number;
  reserved?: number;
  min_stock?: number;
  max_stock?: number;
}

export interface BulkCreateProductStockRequest {
  stocks: CreateProductStockRequest[];
}

// Product Total Stock Response
export interface ProductTotalStock {
  total_quantity: number;
  total_reserved: number;
  available: number;
}

// Product Stock Response Types
export type ProductStockResponse = ApiResponse<ProductStock>;
export type ProductStockListResponse = ApiResponse<ProductStock[]>;
export type ProductTotalStockResponse = ApiResponse<ProductTotalStock>;
