import type { ApiResponse } from '@/features/auth/types';

export type ReportRange = 'hourly' | 'daily' | 'monthly' | 'yearly';

export interface ReportFilterQuery {
  start_date?: string;
  end_date?: string;
  outlet_id?: string;
  product_id?: string;
  category_id?: string;
}

export interface ReportSummary {
  start_date: string;
  end_date: string;
  total_revenue: number;
  total_transactions: number;
  total_items_sold: number;
  average_order_value: number;
  last_updated_at?: string;
}

export interface SalesSeriesPoint {
  period: string;
  total_revenue: number;
  total_transactions: number;
  total_items_sold: number;
  average_order_value: number;
}

export interface ReportSalesSeries {
  range: ReportRange;
  start_date: string;
  end_date: string;
  data: SalesSeriesPoint[];
}

export interface TopProductRow {
  product_id: string;
  product_name: string;
  category_id?: string;
  category_name?: string;
  quantity_sold: number;
  revenue: number;
}

export interface ReportTopProducts {
  start_date: string;
  end_date: string;
  limit: number;
  data: TopProductRow[];
}

export type ProductSalesSortBy =
  | 'quantity_sold'
  | 'revenue'
  | 'product_name'
  | 'product_sku'
  | 'product_status';

export interface ProductSalesRow {
  product_id: string;
  product_name: string;
  product_sku: string;
  product_status: string;
  category_id?: string;
  category_name?: string;
  quantity_sold: number;
  revenue: number;
}

export interface ReportProductSales {
  start_date: string;
  end_date: string;
  sort_by: ProductSalesSortBy;
  sort_order: 'asc' | 'desc';
  page: number;
  per_page: number;
  total: number;
  data: ProductSalesRow[];
}

export interface ReportProductSalesQuery extends ReportFilterQuery {
  search?: string;
  sort_by?: ProductSalesSortBy;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface PaymentMethodRow {
  method: string;
  total_transactions: number;
  total_revenue: number;
  percentage: number;
}

export interface ReportPaymentMethods {
  start_date: string;
  end_date: string;
  data: PaymentMethodRow[];
}

export interface ConsistencyIssueRow {
  sale_id: string;
  invoice_number: string;
  created_at: string;
  sale_subtotal: number;
  items_subtotal: number;
  sale_total: number;
  items_total: number;
}

export interface ReportConsistencyCheck {
  start_date: string;
  end_date: string;
  limit: number;
  total_checked: number;
  total_mismatch: number;
  data: ConsistencyIssueRow[];
}

export interface ReportTransactionItem {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  subtotal: number;
  total: number;
}

export interface ReportTransactionPayment {
  id: string;
  method: string;
  amount: number;
  status: string;
  change?: number | null;
  paid_at?: string | null;
}

export interface ReportTransactionOutlet {
  id: string;
  code: string;
  name: string;
}

export interface ReportTransactionCashier {
  id: string;
  name: string;
  email: string;
}

export interface ReportTransaction {
  id: string;
  invoice_number: string;
  outlet_id: string;
  cashier_id: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
  paid_at?: string | null;
  completed_at?: string | null;
  items: ReportTransactionItem[];
  payment?: ReportTransactionPayment | null;
  outlet?: ReportTransactionOutlet | null;
  cashier?: ReportTransactionCashier | null;
}

export interface ReportTransactionsQuery extends ReportFilterQuery {
  page?: number;
  per_page?: number;
  status?: string;
  payment_status?: string;
  payment_method?: string;
  sort_by?: 'created_at' | 'total' | 'invoice_number';
  sort_order?: 'asc' | 'desc';
}

export type ReportSummaryResponse = ApiResponse<ReportSummary>;
export type ReportSalesResponse = ApiResponse<ReportSalesSeries>;
export type ReportTopProductsResponse = ApiResponse<ReportTopProducts>;
export type ReportProductSalesResponse = ApiResponse<ReportProductSales>;
export type ReportPaymentMethodsResponse = ApiResponse<ReportPaymentMethods>;
export type ReportConsistencyCheckResponse = ApiResponse<ReportConsistencyCheck>;
export type ReportTransactionsResponse = ApiResponse<ReportTransaction[]>;
export type ReportTransactionResponse = ApiResponse<ReportTransaction>;
