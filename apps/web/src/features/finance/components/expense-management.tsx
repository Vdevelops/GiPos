"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Pencil, Plus, ReceiptText, Trash2, TriangleAlert, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/lib/toast"
import {
  useCreateFixedExpenseComponent,
  useCreateGeneralExpense,
  useFinanceSummary,
  useSetOpeningBalance,
  useUpdateFixedExpenseComponent,
  useUpdateGeneralExpenseItem,
  useDeleteGeneralExpenseItem,
} from "../hooks/use-finance"
import type { FinanceDaySummary, FinanceFixedExpenseComponent } from "../types/finance"

type RangeMode = "daily" | "monthly" | "yearly" | "custom"

type DraftLineItem = {
  id: string
  name: string
  amount: string
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function startOfMonth(dateValue: string) {
  const [year, month] = dateValue.split("-")
  if (!year || !month) return dateValue
  return `${year}-${month}-01`
}

function endOfMonth(dateValue: string) {
  const [yearRaw, monthRaw] = dateValue.split("-")
  const year = Number(yearRaw)
  const month = Number(monthRaw)
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return dateValue
  }
  const date = new Date(year, month, 0)
  return toDateInputValue(date)
}

function startOfYear(dateValue: string) {
  const [year] = dateValue.split("-")
  if (!year) return dateValue
  return `${year}-01-01`
}

function endOfYear(dateValue: string) {
  const [year] = dateValue.split("-")
  if (!year) return dateValue
  return `${year}-12-31`
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDateLabel(dateValue: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateValue}T00:00:00`))
}

function formatAmountInput(rawValue: string) {
  const digits = rawValue.replace(/\D/g, "")
  if (!digits) return ""
  return Number(digits).toLocaleString("id-ID")
}

function parseAmountInput(value: string) {
  const digits = value.replace(/\D/g, "")
  if (!digits) return 0
  return Number(digits)
}

function createBlankDraftItem(): DraftLineItem {
  return {
    id: createId("draft"),
    name: "",
    amount: "",
  }
}

interface ExpenseDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly title: string
  readonly description: string
  readonly items: DraftLineItem[]
  readonly onItemsChange: (items: DraftLineItem[]) => void
  readonly onSubmit: () => Promise<void>
  readonly submitLabel: string
  readonly isSubmitting: boolean
}

function ExpenseDialog({
  open,
  onOpenChange,
  title,
  description,
  items,
  onItemsChange,
  onSubmit,
  submitLabel,
  isSubmitting,
}: ExpenseDialogProps) {
  const tCommon = useTranslations("common")

  const updateItem = (itemId: string, patch: Partial<DraftLineItem>) => {
    onItemsChange(
      items.map((item) => (item.id === itemId ? { ...item, ...patch } : item))
    )
  }

  const addItem = () => {
    onItemsChange([...items, createBlankDraftItem()])
  }

  const removeItem = (itemId: string) => {
    const nextItems = items.filter((item) => item.id !== itemId)
    onItemsChange(nextItems.length > 0 ? nextItems : [createBlankDraftItem()])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="grid gap-3 rounded-xl border p-3 md:grid-cols-[1fr_180px_auto]">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {tCommon("add")} {index + 1}
                </label>
                <Input
                  value={item.name}
                  onChange={(event) => updateItem(item.id, { name: event.target.value })}
                  placeholder={title}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{tCommon("amount")}</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={item.amount}
                  onChange={(event) =>
                    updateItem(item.id, { amount: formatAmountInput(event.target.value) })
                  }
                  placeholder="0"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  className="text-muted-foreground"
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={addItem} disabled={isSubmitting}>
            <Plus className="mr-2 h-4 w-4" />
            {tCommon("add")}
          </Button>
          <DialogFooter className="m-0 p-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {tCommon("cancel")}
            </Button>
            <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface FixedComponentDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly title: string
  readonly description: string
  readonly name: string
  readonly amount: string
  readonly onNameChange: (value: string) => void
  readonly onAmountChange: (value: string) => void
  readonly onSubmit: () => Promise<void>
  readonly isSubmitting: boolean
}

function FixedComponentDialog({
  open,
  onOpenChange,
  title,
  description,
  name,
  amount,
  onNameChange,
  onAmountChange,
  onSubmit,
  isSubmitting,
}: FixedComponentDialogProps) {
  const tCommon = useTranslations("common")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nama komponen</label>
            <Input value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="Contoh: PAM" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{tCommon("amount")}</label>
            <Input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(event) => onAmountChange(formatAmountInput(event.target.value))}
              placeholder="0"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {tCommon("cancel")}
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
            {tCommon("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function emptyDay(date: string, openingBalance: number): FinanceDaySummary {
  return {
    date,
    opening_balance: openingBalance,
    sales_cash: 0,
    sales_qris: 0,
    total_revenue: 0,
    general_expenses: [],
    general_expense_total: 0,
    fixed_expenses: [],
    fixed_expense_total: 0,
    warung_balance: 0,
    ending_balance: 0,
    is_ending_balance_minus: false,
    next_opening_balance: openingBalance,
  }
}

export function ExpenseManagement() {
  const t = useTranslations("finance")
  const tCommon = useTranslations("common")

  const [selectedDate, setSelectedDate] = React.useState<string>(toDateInputValue(new Date()))
  const [rangeMode, setRangeMode] = React.useState<RangeMode>("daily")
  const [customStartDate, setCustomStartDate] = React.useState<string>(startOfMonth(selectedDate))
  const [customEndDate, setCustomEndDate] = React.useState<string>(selectedDate)
  const [openingBalanceDraft, setOpeningBalanceDraft] = React.useState<string>("")
  const [generalDialogOpen, setGeneralDialogOpen] = React.useState(false)
  const [generalDraftItems, setGeneralDraftItems] = React.useState<DraftLineItem[]>([
    createBlankDraftItem(),
  ])

  const [fixedComponentDialogOpen, setFixedComponentDialogOpen] = React.useState(false)
  const [fixedComponentName, setFixedComponentName] = React.useState("")
  const [fixedComponentAmount, setFixedComponentAmount] = React.useState("")
  const [editingFixedComponent, setEditingFixedComponent] = React.useState<FinanceFixedExpenseComponent | null>(null)

  const [generalItemDialogOpen, setGeneralItemDialogOpen] = React.useState(false)
  const [generalItemName, setGeneralItemName] = React.useState("")
  const [generalItemAmount, setGeneralItemAmount] = React.useState("")
  const [editingGeneralItem, setEditingGeneralItem] = React.useState<{ id: string, name: string, amount: number } | null>(null)

  const summaryQuery = React.useMemo(() => {
    if (rangeMode === "monthly") {
      return {
        start_date: startOfMonth(selectedDate),
        end_date: endOfMonth(selectedDate),
      }
    }

    if (rangeMode === "yearly") {
      return {
        start_date: startOfYear(selectedDate),
        end_date: endOfYear(selectedDate),
      }
    }

    if (rangeMode === "custom") {
      return {
        start_date: customStartDate,
        end_date: customEndDate,
      }
    }

    return {
      start_date: selectedDate,
      end_date: selectedDate,
    }
  }, [customEndDate, customStartDate, rangeMode, selectedDate])

  const financeSummaryQuery = useFinanceSummary(summaryQuery)
  const setOpeningBalanceMutation = useSetOpeningBalance()
  const createGeneralExpenseMutation = useCreateGeneralExpense()
  const createFixedComponentMutation = useCreateFixedExpenseComponent()
  const updateFixedComponentMutation = useUpdateFixedExpenseComponent()
  const updateGeneralExpenseItemMutation = useUpdateGeneralExpenseItem()
  const deleteGeneralExpenseItemMutation = useDeleteGeneralExpenseItem()

  const summary =
    financeSummaryQuery.data?.success && financeSummaryQuery.data.data
      ? financeSummaryQuery.data.data
      : undefined

  const days = React.useMemo(
    () =>
      (summary?.days ?? []).map((day) => ({
        ...day,
        general_expenses: day.general_expenses ?? [],
        fixed_expenses: day.fixed_expenses ?? [],
      })),
    [summary?.days]
  )

  React.useEffect(() => {
    if (!summary) return
    if (summary.has_opening_balance) {
      setOpeningBalanceDraft(formatAmountInput(String(summary.opening_balance)))
      return
    }
    setOpeningBalanceDraft("")
  }, [summary?.has_opening_balance, summary?.opening_balance])

  React.useEffect(() => {
    if (!days.length) return
    const exists = days.some((day) => day.date === selectedDate)
    if (!exists) {
      setSelectedDate(days[days.length - 1].date)
    }
  }, [days, selectedDate])

  const selectedDay = React.useMemo(() => {
    if (!summary) {
      return emptyDay(selectedDate, 0)
    }

    const found = days.find((day) => day.date === selectedDate)
    if (found) return found

    const fallbackOpening = days.length > 0 ? days[days.length - 1].next_opening_balance : summary.opening_balance
    return emptyDay(selectedDate, fallbackOpening)
  }, [days, selectedDate, summary])

  const isPeriodAggregate = rangeMode !== "daily"

  const periodSalesCash = React.useMemo(
    () => (isPeriodAggregate ? days.reduce((sum, day) => sum + day.sales_cash, 0) : selectedDay.sales_cash),
    [days, isPeriodAggregate, selectedDay.sales_cash]
  )

  const periodSalesQris = React.useMemo(
    () => (isPeriodAggregate ? days.reduce((sum, day) => sum + day.sales_qris, 0) : selectedDay.sales_qris),
    [days, isPeriodAggregate, selectedDay.sales_qris]
  )

  const periodRevenue = isPeriodAggregate ? (summary?.total_revenue ?? 0) : selectedDay.total_revenue
  const periodGeneralExpense = isPeriodAggregate
    ? (summary?.total_general_expense ?? 0)
    : selectedDay.general_expense_total
  const periodFixedExpense = isPeriodAggregate
    ? (summary?.total_fixed_expense ?? 0)
    : selectedDay.fixed_expense_total
  const periodOpeningBalance = isPeriodAggregate
    ? (summary?.opening_balance ?? selectedDay.opening_balance)
    : selectedDay.opening_balance
  const periodWarungBalance = periodRevenue - periodGeneralExpense
  const periodEndingBalance = periodWarungBalance - periodFixedExpense
  const isPeriodEndingBalanceMinus = periodEndingBalance < 0

  const fixedComponents = summary?.fixed_components ?? []

  const generalItems = React.useMemo(() => {
    if (!isPeriodAggregate) {
      return (selectedDay.general_expenses ?? []).flatMap((record) =>
        (record.line_items ?? []).map((item, index) => ({
          key: `${record.id}-${item.id || index}`,
          id: item.id,
          name: item.name,
          amount: item.amount,
        }))
      )
    }

    const itemTotals = new Map<string, number>()
    days.forEach((day) => {
      ;(day.general_expenses ?? []).forEach((record) => {
        ;(record.line_items ?? []).forEach((item) => {
          itemTotals.set(item.name, (itemTotals.get(item.name) ?? 0) + item.amount)
        })
      })
    })

    return Array.from(itemTotals.entries()).map(([name, amount], index) => ({
      key: `period-general-${index}`,
      id: undefined,
      name,
      amount,
    }))
  }, [days, isPeriodAggregate, selectedDay.general_expenses])

  const fixedItems = fixedComponents.map((component) => ({
    key: component.id,
    id: component.id,
    name: component.name,
    amount: isPeriodAggregate ? component.amount * Math.max(days.length, 1) : component.amount,
  }))

  const handleSaveOpeningBalance = async () => {
    const parsedBalance = parseAmountInput(openingBalanceDraft)
    if (summary?.has_opening_balance) {
      return
    }
    if (!Number.isFinite(parsedBalance) || parsedBalance < 0) {
      return
    }

    await setOpeningBalanceMutation.mutateAsync({
      amount: Math.floor(parsedBalance),
      effective_date: selectedDate,
    })
  }

  const handleSaveGeneralExpense = async () => {
    const items = generalDraftItems
      .map((item) => ({
        name: item.name.trim(),
        amount: parseAmountInput(item.amount),
      }))
      .filter((item) => item.name.length > 0 && Number.isFinite(item.amount) && item.amount > 0)

    if (items.length === 0) {
      return
    }

    await createGeneralExpenseMutation.mutateAsync({
      entry_date: selectedDate,
      items,
    })
    setGeneralDialogOpen(false)
    setGeneralDraftItems([createBlankDraftItem()])
  }

  const openCreateFixedComponentDialog = () => {
    setEditingFixedComponent(null)
    setFixedComponentName("")
    setFixedComponentAmount("")
    setFixedComponentDialogOpen(true)
  }

  const openEditFixedComponentDialog = (component: FinanceFixedExpenseComponent) => {
    setEditingFixedComponent(component)
    setFixedComponentName(component.name)
    setFixedComponentAmount(formatAmountInput(String(component.amount)))
    setFixedComponentDialogOpen(true)
  }

  const handleSaveFixedComponent = async () => {
    const amountNum = parseAmountInput(fixedComponentAmount)
    if (!fixedComponentName.trim() || amountNum <= 0) {
      toast.error(tCommon("validationRequired"))
      return
    }

    if (editingFixedComponent) {
      updateFixedComponentMutation.mutate(
        {
          componentId: editingFixedComponent.id,
          payload: {
            name: fixedComponentName.trim(),
            amount: amountNum,
          },
        },
        {
          onSuccess: () => {
            setFixedComponentDialogOpen(false)
          },
        }
      )
    } else {
      createFixedComponentMutation.mutate(
        {
          name: fixedComponentName.trim(),
          amount: amountNum,
        },
        {
          onSuccess: () => {
            setFixedComponentDialogOpen(false)
          },
        }
      )
    }
    setEditingFixedComponent(null)
    setFixedComponentName("")
    setFixedComponentAmount("")
  }

  const openEditGeneralItemDialog = (item: { id: string, name: string, amount: number }) => {
    setEditingGeneralItem(item)
    setGeneralItemName(item.name)
    setGeneralItemAmount(formatAmountInput(item.amount.toString()))
    setGeneralItemDialogOpen(true)
  }

  const handleSaveGeneralItem = async () => {
    if (!editingGeneralItem) return

    const amountNum = parseAmountInput(generalItemAmount)
    if (!generalItemName.trim() || amountNum <= 0) {
      toast.error(tCommon("validationRequired"))
      return
    }

    updateGeneralExpenseItemMutation.mutate(
      {
        itemId: editingGeneralItem.id,
        payload: {
          name: generalItemName.trim(),
          amount: amountNum,
        },
      },
      {
        onSuccess: () => {
          setGeneralItemDialogOpen(false)
        },
      }
    )
  }

  const loading = financeSummaryQuery.isLoading || financeSummaryQuery.isFetching
  const hasOpeningBalance = summary?.has_opening_balance ?? false
  const summaryError = !financeSummaryQuery.data?.success ? financeSummaryQuery.data?.error?.message : undefined
  const periodStart = summary?.start_date ?? selectedDate
  const periodEnd = summary?.end_date ?? selectedDate

  const documentRows = [
    {
      label: t("openingBalance"),
      value: formatCurrency(periodOpeningBalance),
      lineAfter: true,
    },
    {
      label: `${t("revenueTitle")} (${t("salesCash")})`,
      value: formatCurrency(periodSalesCash),
      indent: true,
    },
    {
      label: `${t("revenueTitle")} (${t("salesQris")})`,
      value: formatCurrency(periodSalesQris),
      indent: true,
    },
    {
      label: t("revenueTitle"),
      value: formatCurrency(periodRevenue),
      strong: true,
    },
    {
      label: t("generalExpense"),
      value: `-${formatCurrency(periodGeneralExpense)}`,
      gapBefore: true,
      lineAfter: true,
    },
    {
      label: t("warungBalance"),
      value: formatCurrency(periodWarungBalance),
      strong: true,
      large: true,
    },
  ]

  return (
    <div className="space-y-5">
      <div className="space-y-3 rounded-md border bg-background p-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setGeneralDialogOpen(true)}
              disabled={!hasOpeningBalance}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("addGeneralExpense")}
            </Button>
            <Button
              variant="outline"
              onClick={openCreateFixedComponentDialog}
              disabled={!hasOpeningBalance}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("addFixedExpense")}
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => window.print()}
          >
            <Printer className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full space-y-1 sm:w-56">
            <label className="text-sm font-medium">{t("reportDate")}</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </div>
          <div className="w-full space-y-1 sm:w-56">
            <label className="text-sm font-medium">{t("openingBalance")}</label>
            <Input
              type="text"
              inputMode="numeric"
              value={openingBalanceDraft}
              onChange={(event) => setOpeningBalanceDraft(formatAmountInput(event.target.value))}
              placeholder={t("openingBalancePlaceholder")}
              disabled={hasOpeningBalance}
            />
          </div>
          <Button
            onClick={handleSaveOpeningBalance}
            disabled={hasOpeningBalance || setOpeningBalanceMutation.isPending}
          >
            <ReceiptText className="mr-2 h-4 w-4" />
            {hasOpeningBalance ? tCommon("save") : t("saveOpeningBalance")}
          </Button>
        </div>

        <Tabs value={rangeMode} onValueChange={(value) => setRangeMode(value as RangeMode)}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/60 p-1 print:hidden">
            <TabsTrigger value="daily">{t("daily")}</TabsTrigger>
            <TabsTrigger value="monthly">{t("monthly")}</TabsTrigger>
            <TabsTrigger value="yearly">{t("yearly")}</TabsTrigger>
            <TabsTrigger value="custom">{t("dateRange")}</TabsTrigger>
          </TabsList>
        </Tabs>

        {rangeMode === "custom" && (
          <div className="flex flex-wrap items-end gap-3 print:hidden">
            <div className="w-full space-y-1 sm:w-56">
              <label className="text-sm font-medium">{t("from")}</label>
              <Input
                type="date"
                value={customStartDate}
                onChange={(event) => setCustomStartDate(event.target.value)}
              />
            </div>
            <div className="w-full space-y-1 sm:w-56">
              <label className="text-sm font-medium">{t("to")}</label>
              <Input
                type="date"
                value={customEndDate}
                onChange={(event) => setCustomEndDate(event.target.value)}
              />
            </div>
          </div>
        )}

        {summaryError && <p className="text-sm text-destructive">{summaryError}</p>}
      </div>

      <div className="mx-auto w-full max-w-4xl rounded-md border bg-background px-4 py-6 sm:px-8 sm:py-8">
        <div className="text-center font-serif">
          <p className="text-base tracking-wide">GiPos</p>
          <h2 className="mt-1 text-5xl font-bold tracking-tight text-rose-700">{t("title")}</h2>
          <p className="mt-1 text-base">
            Dari {formatDateLabel(periodStart)} s/d {formatDateLabel(periodEnd)}
          </p>
        </div>

        <div className="mt-8 space-y-3 text-base">
          <div className="flex items-center justify-between border-b border-foreground pb-1 text-lg font-semibold">
            <span>Deskripsi</span>
            <span>{formatDateLabel(periodStart)} - {formatDateLabel(periodEnd)}</span>
          </div>

          {loading ? (
            <p className="py-6 text-center text-lg text-muted-foreground">{tCommon("loading")}</p>
          ) : (
            <div className="space-y-2">
              {documentRows.map((row) => (
                <div key={row.label} className={`space-y-1 ${row.gapBefore ? "pt-4" : ""}`}>
                  <div
                    className={`flex items-baseline justify-between gap-4 ${row.strong ? "font-semibold" : ""} ${row.large ? "text-2xl" : ""}`}
                  >
                    <span className={row.indent ? "pl-6" : ""}>{row.label}</span>
                    <span>{row.value}</span>
                  </div>
                  {row.strong || row.lineAfter ? <div className="border-b border-foreground" /> : null}
                </div>
              ))}
            </div>
          )}

        </div>

        <div className="mt-8 space-y-3 border-t pt-4 text-base">
          <h3 className="text-lg font-semibold uppercase">Detail Pengeluaran</h3>

          {generalItems.length === 0 && fixedItems.length === 0 ? (
            <p className="text-muted-foreground">{t("emptyState")}</p>
          ) : (
            <div className="space-y-3">
              {generalItems.length > 0 ? (
                <div className="space-y-1.5 border-b pb-2">
                  <div className="flex items-center justify-between font-medium">
                    <span>{t("generalExpense")}</span>
                    <span>-{formatCurrency(periodGeneralExpense)}</span>
                  </div>
                  {generalItems.map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-3 pl-6 text-muted-foreground">
                      <span>{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span>{formatCurrency(item.amount)}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 print:hidden"
                          onClick={() => {
                            if (item.id) {
                              openEditGeneralItemDialog(item as any)
                            } else {
                              toast.error("Fitur edit tidak tersedia untuk mode ini")
                            }
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 print:hidden"
                          onClick={() => {
                            if (item.id) {
                              if (confirm("Apakah Anda yakin ingin menghapus pengeluaran ini?")) {
                                deleteGeneralExpenseItemMutation.mutate(item.id)
                              }
                            } else {
                              toast.error("Fitur hapus tidak tersedia untuk mode ini")
                            }
                          }}
                          disabled={deleteGeneralExpenseItemMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {fixedItems.length > 0 ? (
                <div className="space-y-1.5 border-b pb-2">
                  <div className="flex items-center justify-between font-medium">
                    <span>{t("fixedExpense")}</span>
                    <span>-{formatCurrency(periodFixedExpense)}</span>
                  </div>
                  {fixedItems.map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-3 pl-6 text-muted-foreground">
                      <span>{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span>{formatCurrency(item.amount)}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 print:hidden"
                          onClick={() => {
                            const component = fixedComponents.find((fixedComponent) => fixedComponent.id === item.id)
                            if (!component) return
                            openEditFixedComponentDialog(component)
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          <div className="pt-2 text-muted-foreground">
            {t("history")}: {days.length} hari | {t("generalExpense")}: {generalItems.length} | {t("fixedExpense")}: {fixedItems.length}
          </div>

          <div className="mt-4 border-t pt-3">
            <div
              className={`flex items-baseline justify-between text-2xl font-semibold ${isPeriodEndingBalanceMinus ? "text-destructive" : ""}`}
            >
              <span>{t("endingBalance")}</span>
              <span>{formatCurrency(periodEndingBalance)}</span>
            </div>
          </div>

          {isPeriodEndingBalanceMinus ? (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive">
              <TriangleAlert className="h-5 w-5" />
              <span className="text-base font-medium">{t("negativeEndingBalanceWarning")}</span>
            </div>
          ) : null}
        </div>
      </div>

      <ExpenseDialog
        open={generalDialogOpen}
        onOpenChange={setGeneralDialogOpen}
        title={t("generalExpenseDialogTitle")}
        description={t("generalExpenseDialogDescription")}
        items={generalDraftItems}
        onItemsChange={setGeneralDraftItems}
        onSubmit={handleSaveGeneralExpense}
        submitLabel={t("addGeneralExpense")}
        isSubmitting={createGeneralExpenseMutation.isPending}
      />

      <FixedComponentDialog
        open={fixedComponentDialogOpen}
        onOpenChange={setFixedComponentDialogOpen}
        title={editingFixedComponent ? "Edit komponen biaya tetap" : "Tambah komponen biaya tetap"}
        description={editingFixedComponent ? "Perbarui nominal atau nama komponen biaya tetap." : "Komponen ini akan otomatis dihitung setiap hari sebagai biaya tetap."}
        name={fixedComponentName}
        amount={fixedComponentAmount}
        onNameChange={setFixedComponentName}
        onAmountChange={setFixedComponentAmount}
        onSubmit={handleSaveFixedComponent}
        isSubmitting={createFixedComponentMutation.isPending || updateFixedComponentMutation.isPending}
      />

      <FixedComponentDialog
        open={generalItemDialogOpen}
        onOpenChange={setGeneralItemDialogOpen}
        title="Edit komponen pengeluaran"
        description="Perbarui nominal atau nama komponen pengeluaran."
        name={generalItemName}
        amount={generalItemAmount}
        onNameChange={setGeneralItemName}
        onAmountChange={setGeneralItemAmount}
        onSubmit={handleSaveGeneralItem}
        isSubmitting={updateGeneralExpenseItemMutation.isPending}
      />
    </div>
  )
}
