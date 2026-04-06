// Warehouse Types
export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  outlet_id?: string | null;
  outlet?: OutletReference | null;
  type: 'main' | 'secondary' | 'virtual';
  status: 'active' | 'inactive';
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface OutletReference {
  id: string;
  code: string;
  name: string;
}

// Request DTOs
export interface CreateWarehouseRequest {
  code: string;
  name: string;
  address?: string | null;
  outlet_id?: string | null;
  type?: 'main' | 'secondary' | 'virtual';
  status?: 'active' | 'inactive';
  is_default?: boolean;
}

export interface UpdateWarehouseRequest {
  code?: string;
  name?: string;
  address?: string | null;
  outlet_id?: string | null;
  type?: 'main' | 'secondary' | 'virtual';
  status?: 'active' | 'inactive';
  is_default?: boolean;
}

// Query Parameters
export interface WarehouseListQuery {
  outlet_id?: string;
  status?: 'active' | 'inactive';
  page?: number;
  per_page?: number;
}

// Response DTOs (wrapped in ApiResponse)
import type { ApiResponse, ApiMeta } from '@/features/auth/types';

export type WarehouseResponse = ApiResponse<Warehouse>;

// Backend returns WarehouseListResponse directly in data field
export interface WarehouseListResponseData {
  data: Warehouse[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export type WarehouseListResponse = ApiResponse<WarehouseListResponseData> & {
  meta?: ApiMeta & {
    pagination?: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
};
