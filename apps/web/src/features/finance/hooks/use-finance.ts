"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { toast } from "@/lib/toast"
import { FinanceService } from "../services/finance.service"
import type {
  CreateFixedExpenseComponentRequest,
  CreateFinanceExpenseRequest,
  FinanceSummaryQuery,
  SetOpeningBalanceRequest,
  UpdateFixedExpenseComponentRequest,
} from "../types/finance"

const FINANCE_QUERY_BEHAVIOR = {
  refetchOnMount: "always" as const,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchInterval: 10000,
  refetchIntervalInBackground: true,
  staleTime: 0,
}

export function useFinanceSummary(query?: FinanceSummaryQuery) {
  return useQuery({
    queryKey: ["finance", "summary", query],
    queryFn: () => FinanceService.getSummary(query),
    ...FINANCE_QUERY_BEHAVIOR,
  })
}

export function useSetOpeningBalance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SetOpeningBalanceRequest) =>
      FinanceService.setOpeningBalance(payload),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.error?.message || "Gagal menyimpan saldo awal")
        return
      }

      queryClient.invalidateQueries({ queryKey: ["finance"] })
      toast.success("Saldo awal berhasil disimpan")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan saldo awal")
    },
  })
}

export function useCreateGeneralExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateFinanceExpenseRequest) =>
      FinanceService.createGeneralExpense(payload),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.error?.message || "Gagal menambahkan pengeluaran")
        return
      }

      queryClient.invalidateQueries({ queryKey: ["finance"] })
      toast.success("Pengeluaran berhasil ditambahkan")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Gagal menambahkan pengeluaran")
    },
  })
}

export function useCreateFixedExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateFinanceExpenseRequest) =>
      FinanceService.createFixedExpense(payload),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.error?.message || "Gagal menambahkan pengeluaran tetap")
        return
      }

      queryClient.invalidateQueries({ queryKey: ["finance"] })
      toast.success("Pengeluaran tetap berhasil ditambahkan")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Gagal menambahkan pengeluaran tetap")
    },
  })
}

export function useFixedExpenseComponents() {
  return useQuery({
    queryKey: ["finance", "fixed-expense-components"],
    queryFn: () => FinanceService.getFixedExpenseComponents(),
    ...FINANCE_QUERY_BEHAVIOR,
  })
}

export function useCreateFixedExpenseComponent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateFixedExpenseComponentRequest) =>
      FinanceService.createFixedExpenseComponent(payload),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.error?.message || "Gagal menambahkan komponen biaya tetap")
        return
      }

      queryClient.invalidateQueries({ queryKey: ["finance"] })
      toast.success("Komponen biaya tetap berhasil ditambahkan")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Gagal menambahkan komponen biaya tetap")
    },
  })
}

export function useUpdateFixedExpenseComponent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      componentId,
      payload,
    }: {
      componentId: string
      payload: UpdateFixedExpenseComponentRequest
    }) => FinanceService.updateFixedExpenseComponent(componentId, payload),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.error?.message || "Gagal memperbarui komponen biaya tetap")
        return
      }

      queryClient.invalidateQueries({ queryKey: ["finance"] })
      toast.success("Komponen biaya tetap berhasil diperbarui")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui komponen biaya tetap")
    },
  })
}

export function useDeleteFixedExpenseComponent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (componentId: string) => FinanceService.deleteFixedExpenseComponent(componentId),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.error?.message || "Gagal menghapus komponen biaya tetap")
        return
      }

      queryClient.invalidateQueries({ queryKey: ["finance"] })
      toast.success("Komponen biaya tetap berhasil dihapus")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus komponen biaya tetap")
    },
  })
}

export function useUpdateGeneralExpenseItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      itemId,
      payload,
    }: {
      itemId: string
      payload: import("../types/finance").UpdateFinanceExpenseItemRequest
    }) => FinanceService.updateGeneralExpenseItem(itemId, payload),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.error?.message || "Gagal memperbarui pengeluaran")
        return
      }

      queryClient.invalidateQueries({ queryKey: ["finance"] })
      toast.success("Pengeluaran berhasil diperbarui")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui pengeluaran")
    },
  })
}

export function useDeleteGeneralExpenseItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) => FinanceService.deleteGeneralExpenseItem(itemId),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.error?.message || "Gagal menghapus pengeluaran")
        return
      }

      queryClient.invalidateQueries({ queryKey: ["finance"] })
      toast.success("Pengeluaran berhasil dihapus")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus pengeluaran")
    },
  })
}
