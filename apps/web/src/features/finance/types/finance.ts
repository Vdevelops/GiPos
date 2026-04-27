import type { ApiResponse } from "@/features/auth/types"

export interface FinanceSummaryQuery {
  start_date?: string
  end_date?: string
}

export interface SetOpeningBalanceRequest {
  amount: number
  effective_date?: string
}

export interface CreateFinanceExpenseItemRequest {
  name: string
  amount: number
}

export interface CreateFinanceExpenseRequest {
  entry_date?: string
  notes?: string
  items: CreateFinanceExpenseItemRequest[]
}

export interface CreateFixedExpenseComponentRequest {
  name: string
  amount: number
}

export interface UpdateFixedExpenseComponentRequest {
  name?: string
  amount?: number
}

export interface UpdateFinanceExpenseItemRequest {
  name?: string
  amount?: number
}

export interface FinanceOpeningBalance {
  id: string
  effective_date: string
  amount: number
  created_at: string
  updated_at: string
}

export interface FinanceExpenseLineItem {
  id: string
  name: string
  amount: number
}

export interface FinanceFixedExpenseComponent {
  id: string
  name: string
  amount: number
  created_at: string
  updated_at: string
}

export interface FinanceExpenseRecord {
  id: string
  kind: "general" | "fixed"
  entry_date: string
  total: number
  notes?: string
  created_at: string
  updated_at: string
  line_items: FinanceExpenseLineItem[]
}

export interface FinanceDaySummary {
  date: string
  opening_balance: number
  sales_cash: number
  sales_qris: number
  total_revenue: number
  general_expenses: FinanceExpenseRecord[]
  general_expense_total: number
  fixed_expenses: FinanceExpenseRecord[]
  fixed_expense_total: number
  warung_balance: number
  ending_balance: number
  is_ending_balance_minus: boolean
  next_opening_balance: number
}

export interface FinanceSummary {
  start_date: string
  end_date: string
  has_opening_balance: boolean
  opening_balance: number
  total_revenue: number
  total_general_expense: number
  total_fixed_expense: number
  ending_balance: number
  fixed_components: FinanceFixedExpenseComponent[]
  days: FinanceDaySummary[]
}

export type FinanceSummaryResponse = ApiResponse<FinanceSummary>
export type SetOpeningBalanceResponse = ApiResponse<FinanceOpeningBalance>
export type CreateFinanceExpenseResponse = ApiResponse<FinanceExpenseRecord>
export type FixedExpenseComponentsResponse = ApiResponse<FinanceFixedExpenseComponent[]>
export type CreateFixedExpenseComponentResponse = ApiResponse<FinanceFixedExpenseComponent>
export type UpdateFixedExpenseComponentResponse = ApiResponse<FinanceFixedExpenseComponent>
