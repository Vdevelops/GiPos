import type { ApiResponse, ApiMeta } from '@/features/auth/types';
import type { Product } from '@/features/products/types';

// Sale Types
export interface Sale {
  id: string;
  outlet_id: string;
  shift_id?: string | null;
  invoice_number: string;
  customer_id?: string | null;
  cashier_id: string;
  items: SaleItem[];
  subtotal: number; // in sen
  discount_amount: number; // in sen
  discount_percent: number;
  tax_amount: number; // in sen
  total: number; // in sen
  payment_method: 'cash' | 'qris' | 'e_wallet' | 'transfer' | 'card';
  payment_status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes?: string | null;
  completed_at?: string | null;
  paid_at?: string | null;
  cancelled_at?: string | null;
  created_at: string;
  updated_at: string;
  outlet?: SaleOutlet | null;
  cashier?: SaleCashier | null;
  payment?: Payment | null;
}

export interface SaleItem {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number; // in sen
  discount_amount: number; // in sen
  discount_percent: number;
  tax_amount: number; // in sen
  subtotal: number; // in sen
  total: number; // in sen
  product?: Product | null;
}

export interface SaleOutlet {
  id: string;
  code: string;
  name: string;
}

export interface SaleCashier {
  id: string;
  name: string;
  email: string;
}

// Sale Request Types
export interface CreateSaleRequest {
  outlet_id: string;
  shift_id?: string | null;
  customer_id?: string | null;
  items: CreateSaleItemRequest[];
  discount_amount?: number | null; // in sen
  discount_percent?: number | null;
  taxable?: boolean;
  payment_method: 'cash' | 'qris' | 'e_wallet' | 'transfer' | 'card';
  notes?: string | null;
}

export interface CreateSaleItemRequest {
  product_id: string;
  quantity: number;
  unit_price?: number | null; // in sen, if not provided use product price
  discount_amount?: number | null; // in sen
  discount_percent?: number | null;
}

export interface UpdateSaleRequest {
  status?: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes?: string | null;
}

// Sale List Query
export interface SaleListQuery {
  page?: number;
  per_page?: number;
  outlet_id?: string;
  shift_id?: string;
  customer_id?: string;
  status?: 'pending' | 'completed' | 'cancelled' | 'refunded';
  payment_status?: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  payment_method?: 'cash' | 'qris' | 'e_wallet' | 'transfer' | 'card';
  start_date?: string; // ISO 8601
  end_date?: string; // ISO 8601
  search?: string; // search by invoice number
  sort_by?: 'created_at' | 'total' | 'invoice_number';
  sort_order?: 'asc' | 'desc';
}

// Sale Response Types
export type SaleResponse = ApiResponse<Sale>;
export type SaleListResponse = ApiResponse<Sale[]> & {
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

// Payment Types
export interface Payment {
  id: string;
  sale_id: string;
  method: 'cash' | 'qris' | 'e_wallet' | 'transfer' | 'card';
  amount: number; // in sen
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  gateway?: string | null;
  gateway_id?: string | null;
  qr_code_url?: string | null;
  qris_expired_at?: string | null;
  e_wallet_type?: 'gopay' | 'ovo' | 'shopee_pay' | 'dana' | null;
  payment_link?: string | null;
  bank_name?: string | null;
  account_number?: string | null;
  card_type?: string | null;
  card_last_4?: string | null;
  paid_at?: string | null;
  failed_at?: string | null;
  failure_reason?: string | null;
  created_at: string;
  updated_at: string;
}

// Payment Request Types
export interface ProcessPaymentRequest {
  sale_id: string;
  method: 'cash' | 'qris' | 'e_wallet' | 'transfer' | 'card';
  amount: number; // in sen
  cash_received?: number | null; // in sen, for cash payment
  e_wallet_type?: 'gopay' | 'ovo' | 'shopee_pay' | 'dana' | null;
  bank_name?: string | null;
  account_number?: string | null;
}

export interface UpdatePaymentRequest {
  status?: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  gateway_id?: string | null;
  qr_code_url?: string | null;
  payment_link?: string | null;
  failure_reason?: string | null;
}

// Payment Response Types
export type PaymentResponse = ApiResponse<Payment>;
