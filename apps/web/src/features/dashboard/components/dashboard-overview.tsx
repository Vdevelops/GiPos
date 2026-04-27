"use client"

import * as React from "react"
import { TrendingDown, TrendingUp, ShoppingCart, Package, DollarSign, CreditCard } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { formatCurrency } from "@/lib/currency"
import {
  useReportPaymentMethods,
  useReportSales,
  useReportSummary,
  useReportTopProducts,
  useReportTransactions,
} from "@/features/reports/hooks/use-reports"

function toDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function toPercentChange(current: number, previous: number): { value: string; trend: "up" | "down" } {
  if (previous === 0 && current === 0) {
    return { value: "0%", trend: "up" }
  }

  if (previous === 0) {
    return { value: "+100%", trend: "up" }
  }

  const percent = ((current - previous) / Math.abs(previous)) * 100
  const trend: "up" | "down" = percent >= 0 ? "up" : "down"
  const rounded = Math.round(Math.abs(percent))
  const prefix = trend === "up" ? "+" : "-"

  return { value: `${prefix}${rounded}%`, trend }
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value)
}

export function DashboardOverview() {
  const t = useTranslations("dashboard")
  const tc = useTranslations("common")

  const today = React.useMemo(() => toDateString(new Date()), [])
  const yesterday = React.useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() - 1)
    return toDateString(date)
  }, [])

  const todayFilter = React.useMemo(() => ({ start_date: today, end_date: today }), [today])
  const yesterdayFilter = React.useMemo(() => ({ start_date: yesterday, end_date: yesterday }), [yesterday])
  const transactionsFilter = React.useMemo(
    () => ({
      start_date: today,
      end_date: today,
      page: 1,
      per_page: 4,
      sort_by: "created_at" as const,
      sort_order: "desc" as const,
    }),
    [today]
  )

  const { data: todaySummaryRes, isLoading: isTodaySummaryLoading, isError: isTodaySummaryError } = useReportSummary(todayFilter)
  const { data: yesterdaySummaryRes } = useReportSummary(yesterdayFilter)
  const { data: salesRes, isLoading: isSalesLoading, isError: isSalesError } = useReportSales("daily")
  const { data: topProductsRes, isLoading: isTopProductsLoading, isError: isTopProductsError } = useReportTopProducts(5, todayFilter)
  const { data: paymentMethodsRes, isLoading: isPaymentMethodsLoading, isError: isPaymentMethodsError } = useReportPaymentMethods(todayFilter)
  const { data: transactionsRes, isLoading: isTransactionsLoading, isError: isTransactionsError } = useReportTransactions(transactionsFilter)

  const todaySummary = todaySummaryRes?.data
  const yesterdaySummary = yesterdaySummaryRes?.data

  const revenueChange = toPercentChange(todaySummary?.total_revenue ?? 0, yesterdaySummary?.total_revenue ?? 0)
  const transactionsChange = toPercentChange(
    todaySummary?.total_transactions ?? 0,
    yesterdaySummary?.total_transactions ?? 0
  )
  const soldItemsChange = toPercentChange(
    todaySummary?.total_items_sold ?? 0,
    yesterdaySummary?.total_items_sold ?? 0
  )

  const metrics = [
    {
      title: t("totalRevenue"),
      value: formatCurrency(todaySummary?.total_revenue ?? 0),
      change: revenueChange.value,
      trend: revenueChange.trend,
      description: t("vsYesterday"),
      icon: DollarSign,
    },
    {
      title: t("transactions"),
      value: formatNumber(todaySummary?.total_transactions ?? 0),
      change: transactionsChange.value,
      trend: transactionsChange.trend,
      description: t("vsYesterday"),
      icon: ShoppingCart,
    },
    {
      title: t("productsSold"),
      value: formatNumber(todaySummary?.total_items_sold ?? 0),
      change: soldItemsChange.value,
      trend: soldItemsChange.trend,
      description: t("vsYesterday"),
      icon: Package,
    },
    {
      title: t("paymentMethods"),
      value: formatNumber(paymentMethodsRes?.data?.data?.length ?? 0),
      change: "",
      trend: "up" as const,
      description: t("today"),
      icon: CreditCard,
    },
  ]

  const salesPoints = salesRes?.data?.data ?? []
  const revenueRows = salesPoints.slice(-7)
  const topProducts = topProductsRes?.data?.data ?? []
  const paymentMethods = paymentMethodsRes?.data?.data ?? []
  const recentTransactions = transactionsRes?.data ?? []

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("summary")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {(isTodaySummaryLoading || isTodaySummaryError) && (
          <div className="col-span-full text-sm text-muted-foreground">
            {isTodaySummaryLoading ? tc("loading") : tc("error")}
          </div>
        )}

        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                {metric.change ? (
                  <Badge variant={metric.trend === "up" ? "default" : "secondary"}>
                    {metric.trend === "up" ? (
                      <TrendingUp className="mr-1 h-3 w-3" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3" />
                    )}
                    {metric.change}
                  </Badge>
                ) : null}
                <span>{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-7">
        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>{t("revenueChart")}</CardTitle>
            <CardDescription>{t("revenueChartDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isSalesLoading ? (
              <div className="flex h-[220px] items-center justify-center rounded-lg border-2 border-dashed sm:h-[260px] lg:h-[300px]">
                <p className="text-muted-foreground">{tc("loading")}</p>
              </div>
            ) : isSalesError ? (
              <div className="flex h-[220px] items-center justify-center rounded-lg border-2 border-dashed sm:h-[260px] lg:h-[300px]">
                <p className="text-muted-foreground">{tc("error")}</p>
              </div>
            ) : revenueRows.length === 0 ? (
              <div className="flex h-[220px] items-center justify-center rounded-lg border-2 border-dashed sm:h-[260px] lg:h-[300px]">
                <p className="text-muted-foreground">{t("chartPlaceholder")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {revenueRows.map((row) => (
                  <div key={row.period} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{row.period}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("transactions")}: {formatNumber(row.total_transactions)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">{formatCurrency(row.total_revenue)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>{t("topProducts")}</CardTitle>
            <CardDescription>{t("topProductsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isTopProductsLoading ? (
              <p className="text-sm text-muted-foreground">{tc("loading")}</p>
            ) : isTopProductsError ? (
              <p className="text-sm text-muted-foreground">{tc("error")}</p>
            ) : topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("chartPlaceholder")}</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product) => (
                  <div key={product.product_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-muted" />
                      <div>
                        <p className="line-clamp-1 text-sm font-medium">{product.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("sold")}: {formatNumber(product.quantity_sold)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">{formatCurrency(product.revenue)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("paymentMethods")}</CardTitle>
            <CardDescription>{t("paymentMethodsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isPaymentMethodsLoading ? (
              <p className="text-sm text-muted-foreground">{tc("loading")}</p>
            ) : isPaymentMethodsError ? (
              <p className="text-sm text-muted-foreground">{tc("error")}</p>
            ) : paymentMethods.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("pieChartPlaceholder")}</p>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.method} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{method.method}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(method.total_transactions)} {t("transactions").toLowerCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(method.total_revenue)}</p>
                      <p className="text-xs text-muted-foreground">{method.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("recentActivity")}</CardTitle>
            <CardDescription>{t("recentActivityDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isTransactionsLoading ? (
              <p className="text-sm text-muted-foreground">{tc("loading")}</p>
            ) : isTransactionsError ? (
              <p className="text-sm text-muted-foreground">{tc("error")}</p>
            ) : recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("chartPlaceholder")}</p>
            ) : (
              <div className="max-h-[340px] space-y-4 overflow-y-auto pr-1">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{t("transaction")} #{transaction.invoice_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">{formatCurrency(transaction.total)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


