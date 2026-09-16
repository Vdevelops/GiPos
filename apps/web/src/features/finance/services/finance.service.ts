import { apiRequest } from "@/lib/api"
import type {
  CreateFixedExpenseComponentRequest,
  CreateFinanceExpenseRequest,
  CreateFixedExpenseComponentResponse,
  DeleteFixedExpenseComponentResponse,
  CreateFinanceExpenseResponse,
  FixedExpenseComponentsResponse,
  FinanceSummary,
  FinanceSummaryQuery,
  FinanceSummaryResponse,
  FinanceOpeningBalance,
  SetOpeningBalanceRequest,
  SetOpeningBalanceResponse,
  UpdateFixedExpenseComponentRequest,
  UpdateFixedExpenseComponentResponse,
} from "../types/finance"

function toQueryString(
  query?: Record<string, string | number | undefined | null> | FinanceSummaryQuery
): string {
  if (!query) return ""

  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      params.append(key, String(value))
    }
  })

  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export class FinanceService {
  static async getSummary(query?: FinanceSummaryQuery): Promise<FinanceSummaryResponse> {
    return apiRequest<FinanceSummary>(`finance/summary${toQueryString(query)}`, {
      method: "GET",
      requireAuth: true,
    }) as Promise<FinanceSummaryResponse>
  }

  static async setOpeningBalance(
    payload: SetOpeningBalanceRequest
  ): Promise<SetOpeningBalanceResponse> {
    return apiRequest<FinanceOpeningBalance>("finance/opening-balance", {
      method: "POST",
      body: JSON.stringify(payload),
      requireAuth: true,
    }) as Promise<SetOpeningBalanceResponse>
  }

  static async createGeneralExpense(
    payload: CreateFinanceExpenseRequest
  ): Promise<CreateFinanceExpenseResponse> {
    return apiRequest("finance/expenses/general", {
      method: "POST",
      body: JSON.stringify(payload),
      requireAuth: true,
    }) as Promise<CreateFinanceExpenseResponse>
  }

  static async createFixedExpense(
    payload: CreateFinanceExpenseRequest
  ): Promise<CreateFinanceExpenseResponse> {
    return apiRequest("finance/expenses/fixed", {
      method: "POST",
      body: JSON.stringify(payload),
      requireAuth: true,
    }) as Promise<CreateFinanceExpenseResponse>
  }

  static async getFixedExpenseComponents(): Promise<FixedExpenseComponentsResponse> {
    return apiRequest("finance/fixed-expense-components", {
      method: "GET",
      requireAuth: true,
    }) as Promise<FixedExpenseComponentsResponse>
  }

  static async createFixedExpenseComponent(
    payload: CreateFixedExpenseComponentRequest
  ): Promise<CreateFixedExpenseComponentResponse> {
    return apiRequest("finance/fixed-expense-components", {
      method: "POST",
      body: JSON.stringify(payload),
      requireAuth: true,
    }) as Promise<CreateFixedExpenseComponentResponse>
  }

  static async updateFixedExpenseComponent(
    componentId: string,
    payload: UpdateFixedExpenseComponentRequest
  ): Promise<UpdateFixedExpenseComponentResponse> {
    return apiRequest<any>(`finance/fixed-expense-components/${componentId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      requireAuth: true,
    }) as Promise<UpdateFixedExpenseComponentResponse>
  }

  static async deleteFixedExpenseComponent(
    componentId: string
  ): Promise<DeleteFixedExpenseComponentResponse> {
    return apiRequest<{ deleted: boolean }>(`finance/fixed-expense-components/${componentId}`, {
      method: "DELETE",
      requireAuth: true,
    }) as Promise<DeleteFixedExpenseComponentResponse>
  }

  static async updateGeneralExpenseItem(
    itemId: string,
    payload: import("../types/finance").UpdateFinanceExpenseItemRequest
  ): Promise<import("@/features/auth/types").ApiResponse<import("../types/finance").FinanceExpenseLineItem>> {
    return apiRequest<import("../types/finance").FinanceExpenseLineItem>(`finance/expenses/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      requireAuth: true,
    }) as Promise<import("@/features/auth/types").ApiResponse<import("../types/finance").FinanceExpenseLineItem>>
  }

  static async deleteGeneralExpenseItem(
    itemId: string
  ): Promise<import("@/features/auth/types").ApiResponse<void>> {
    return apiRequest<void>(`finance/expenses/items/${itemId}`, {
      method: "DELETE",
      requireAuth: true,
    }) as Promise<import("@/features/auth/types").ApiResponse<void>>
  }
}
