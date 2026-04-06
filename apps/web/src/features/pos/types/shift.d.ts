import type { ApiResponse, ApiMeta } from '@/features/auth/types';

// Shift Types
export interface Shift {
  id: string;
  outlet_id: string;
  user_id: string;
  shift_number: string;
  status: 'open' | 'closed';
  opening_cash: number; // in sen
  opening_time: string;
  opening_notes?: string | null;
  closing_cash?: number | null; // in sen
  expected_cash?: number | null; // in sen
  difference?: number | null; // in sen
  closing_time?: string | null;
  closing_notes?: string | null;
  total_sales: number; // in sen
  total_transactions: number;
  cash_sales: number; // in sen
  non_cash_sales: number; // in sen
  created_at: string;
  updated_at: string;
  outlet?: ShiftOutlet | null;
  user?: ShiftUser | null;
}

export interface ShiftOutlet {
  id: string;
  code: string;
  name: string;
}

export interface ShiftUser {
  id: string;
  name: string;
  email: string;
}

// Shift Request Types
export interface CreateShiftRequest {
  outlet_id: string;
  opening_cash: number; // in sen
  opening_notes?: string | null;
}

export interface CloseShiftRequest {
  closing_cash: number; // in sen
  closing_notes?: string | null;
}

// Shift List Query
export interface ShiftListQuery {
  page?: number;
  per_page?: number;
  outlet_id?: string;
  user_id?: string;
  status?: 'open' | 'closed';
  start_date?: string; // ISO 8601
  end_date?: string; // ISO 8601
  sort_by?: 'opening_time' | 'closing_time' | 'total_sales';
  sort_order?: 'asc' | 'desc';
}

// Shift Response Types
export type ShiftResponse = ApiResponse<Shift>;
export type ShiftListResponse = ApiResponse<Shift[]> & {
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
