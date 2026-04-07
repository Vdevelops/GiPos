"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Eye,
  Package,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/currency";
import {
  useReportConsistencyCheck,
  useReportPaymentMethods,
  useReportSales,
  useReportSummary,
  useReportTransaction,
  useReportTransactions,
  useReportTopProducts,
} from "@/features/reports/hooks/use-reports";
import type {
  ReportFilterQuery,
  ReportRange,
  ReportTransactionsQuery,
} from "@/features/reports/types/report";

type DatePreset = "today" | "monthly" | "yearly" | "date_range";
const TRANSACTION_PAGE_SIZE = 20;
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDateRangePreset(
  preset: DatePreset,
  customStartDate: string,
  customEndDate: string
): { start: string; end: string } {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const today = formatDateOnly(end);

  if (preset === "today") {
    return { start: today, end: today };
  }

  if (preset === "monthly") {
    const year = end.getUTCFullYear();
    const month = end.getUTCMonth();
    const monthStart = new Date(Date.UTC(year, month, 1));
    const monthEnd = new Date(Date.UTC(year, month + 1, 0));
    return { start: formatDateOnly(monthStart), end: formatDateOnly(monthEnd) };
  }

  if (preset === "yearly") {
    const year = end.getUTCFullYear();
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const yearEnd = new Date(Date.UTC(year, 11, 31));
    return { start: formatDateOnly(yearStart), end: formatDateOnly(yearEnd) };
  }

  const fallbackStart = customStartDate || today;
  const fallbackEnd = customEndDate || today;
  if (fallbackStart <= fallbackEnd) {
    return { start: fallbackStart, end: fallbackEnd };
  }
  return { start: fallbackEnd, end: fallbackStart };
}

function getRangeByPreset(preset: DatePreset): ReportRange {
  if (preset === "today") {
    return "hourly";
  }
  if (preset === "yearly") {
    return "monthly";
  }
  return "daily";
}

function formatXAxisLabel(period: string, range: ReportRange, preset: DatePreset): string {
  if (range === "hourly") {
    const hour = period.slice(11, 16);
    return hour.replace(":", ".");
  }

  if (range === "monthly") {
    const monthRaw = Number(period.slice(5, 7));
    if (!Number.isNaN(monthRaw) && monthRaw >= 1 && monthRaw <= 12) {
      return MONTH_LABELS[monthRaw - 1];
    }
    return period;
  }

  if (preset === "monthly" && range === "daily") {
    const day = period.slice(8, 10);
    return day;
  }

  if (preset === "date_range" && range === "daily") {
    return period.slice(5, 10);
  }

  return period;
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadgeVariant(status: string): "secondary" | "destructive" | "outline" {
  const normalized = status.toLowerCase();
  if (normalized === "failed" || normalized === "cancelled" || normalized === "refunded") {
    return "destructive";
  }
  if (normalized === "completed") {
    return "secondary";
  }
  return "outline";
}

type LinePoint = {
  x: number;
  period: string;
  label: string;
  showLabel: boolean;
  revenueY: number;
  transactionY: number;
};

type XYPoint = {
  x: number;
  y: number;
};

type ChartTick = {
  y: number;
  revenueValue: number;
  transactionValue: number;
};

function buildLinePath(points: XYPoint[]): string {
  if (points.length === 0) {
    return "";
  }

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");
}

function formatAxisNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}

function getPresetRangeForSelection(preset: DatePreset): { start: string; end: string } {
  return getDateRangePreset(preset, "", "");
}

export function ReportsAnalytics() {
  const now = new Date();
  const todayDate = formatDateOnly(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  );
  const monthStartDate = formatDateOnly(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  );

  const [datePreset, setDatePreset] = useState<DatePreset>("monthly");
  const [customStartDate, setCustomStartDate] = useState<string>(monthStartDate);
  const [customEndDate, setCustomEndDate] = useState<string>(todayDate);
  const [transactionPage, setTransactionPage] = useState<number>(1);
  const [detailOpen, setDetailOpen] = useState<boolean>(false);
  const [selectedTransactionID, setSelectedTransactionID] = useState<string | null>(null);

  const handleDatePresetChange = (value: string) => {
    const nextPreset = value as DatePreset;
    setDatePreset(nextPreset);

    if (nextPreset !== "date_range") {
      const presetRange = getPresetRangeForSelection(nextPreset);
      setCustomStartDate(presetRange.start);
      setCustomEndDate(presetRange.end);
    }
  };

  const handleStartDateChange = (value: string) => {
    setCustomStartDate(value);
  };

  const handleEndDateChange = (value: string) => {
    setCustomEndDate(value);
  };

  const salesRange = useMemo(() => getRangeByPreset(datePreset), [datePreset]);

  const dateRange = useMemo(
    () => getDateRangePreset(datePreset, customStartDate, customEndDate),
    [customEndDate, customStartDate, datePreset]
  );
  const filterQuery = useMemo<ReportFilterQuery>(
    () => ({ start_date: dateRange.start, end_date: dateRange.end }),
    [dateRange.end, dateRange.start]
  );

  const transactionQuery = useMemo<ReportTransactionsQuery>(
    () => ({
      start_date: dateRange.start,
      end_date: dateRange.end,
      page: transactionPage,
      per_page: TRANSACTION_PAGE_SIZE,
      sort_by: "created_at",
      sort_order: "desc",
    }),
    [dateRange.end, dateRange.start, transactionPage]
  );

  useEffect(() => {
    setTransactionPage(1);
  }, [dateRange.end, dateRange.start]);

  const summaryQuery = useReportSummary(filterQuery);
  const salesQuery = useReportSales(salesRange, filterQuery);
  const topProductsQuery = useReportTopProducts(10, filterQuery);
  const paymentMethodsQuery = useReportPaymentMethods(filterQuery);
  const consistencyQuery = useReportConsistencyCheck(5, filterQuery);
  const transactionsQuery = useReportTransactions(transactionQuery);
  const transactionDetailQuery = useReportTransaction(detailOpen ? selectedTransactionID : null);

  const summary = summaryQuery.data?.success ? summaryQuery.data.data : undefined;
  const salesData = salesQuery.data?.success ? salesQuery.data.data?.data ?? [] : [];
  const topProducts = topProductsQuery.data?.success ? topProductsQuery.data.data?.data ?? [] : [];
  const paymentMethods = paymentMethodsQuery.data?.success
    ? paymentMethodsQuery.data.data?.data ?? []
    : [];
  const consistency = consistencyQuery.data?.success
    ? consistencyQuery.data.data
    : undefined;
  const transactions = transactionsQuery.data?.success
    ? transactionsQuery.data.data ?? []
    : [];
  const transactionPagination = transactionsQuery.data?.meta?.pagination;

  const selectedTransaction = transactionDetailQuery.data?.success
    ? transactionDetailQuery.data.data
    : transactions.find((item) => item.id === selectedTransactionID);

  const maxRevenue = useMemo(
    () => Math.max(...salesData.map((item) => item.total_revenue), 0),
    [salesData]
  );

  const maxTransactions = useMemo(
    () => Math.max(...salesData.map((item) => item.total_transactions), 0),
    [salesData]
  );

  const salesLineChart = useMemo(() => {
    const leftPadding = 64;
    const rightPadding = 64;
    const topPadding = 12;
    const bottomPadding = 34;
    const chartHeight = 250;
    const innerHeight = chartHeight - topPadding - bottomPadding;
    const minStepX = 44;
    const maxLabelCount = 12;
    const labelStep = Math.max(1, Math.ceil(salesData.length / maxLabelCount));
    const lineWidth = Math.max(760, salesData.length * minStepX + leftPadding + rightPadding);
    const chartStartX = leftPadding;
    const chartEndX = lineWidth - rightPadding;
    const usableWidth = chartEndX - chartStartX;
    const yTicks: ChartTick[] = [1, 0.75, 0.5, 0.25, 0].map((ratio) => {
      const y = topPadding + (1 - ratio) * innerHeight;
      return {
        y,
        revenueValue: Math.round(maxRevenue * ratio),
        transactionValue: Math.round(maxTransactions * ratio),
      };
    });

    const points: LinePoint[] = salesData.map((item, index) => {
      const normalizedRevenue = maxRevenue > 0 ? item.total_revenue / maxRevenue : 0;
      const normalizedTransactions = maxTransactions > 0 ? item.total_transactions / maxTransactions : 0;
      const x = chartStartX + (salesData.length <= 1 ? 0 : (usableWidth * index) / (salesData.length - 1));
      const yRevenue = topPadding + (1 - normalizedRevenue) * innerHeight;
      const yTransactions = topPadding + (1 - normalizedTransactions) * innerHeight;

      return {
        x,
        period: item.period,
        label: formatXAxisLabel(item.period, salesRange, datePreset),
        showLabel: index % labelStep === 0 || index === salesData.length - 1,
        revenueY: yRevenue,
        transactionY: yTransactions,
      };
    });

    const revenuePath = buildLinePath(points.map((point) => ({ x: point.x, y: point.revenueY })));
    const transactionPath = buildLinePath(points.map((point) => ({ x: point.x, y: point.transactionY })));

    return {
      chartHeight,
      lineWidth,
      chartStartX,
      chartEndX,
      points,
      yTicks,
      revenuePath,
      transactionPath,
    };
  }, [datePreset, maxRevenue, maxTransactions, salesData, salesRange]);

  const paymentChart = useMemo(() => {
    if (paymentMethods.length === 0) {
      return "";
    }

    const colors = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];
    let cursor = 0;
    const segments = paymentMethods.map((item, index) => {
      const start = cursor;
      const sweep = item.percentage;
      cursor += sweep;
      return `${colors[index % colors.length]} ${start}% ${cursor}%`;
    });

    return `conic-gradient(${segments.join(", ")})`;
  }, [paymentMethods]);

  const hasError =
    (summaryQuery.data && !summaryQuery.data.success) ||
    (salesQuery.data && !salesQuery.data.success) ||
    (topProductsQuery.data && !topProductsQuery.data.success) ||
    (paymentMethodsQuery.data && !paymentMethodsQuery.data.success) ||
    (consistencyQuery.data && !consistencyQuery.data.success) ||
    (transactionsQuery.data && !transactionsQuery.data.success);

  const mismatchRate = useMemo(() => {
    if (!consistency || consistency.total_checked <= 0) {
      return 0;
    }
    return (consistency.total_mismatch / consistency.total_checked) * 100;
  }, [consistency]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground lg:text-base">
            Near real-time insights from completed transactions
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={datePreset} onValueChange={handleDatePresetChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="date_range">Date Range</SelectItem>
            </SelectContent>
          </Select>

          {datePreset === "date_range" && (
            <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5">
              <input
                type="date"
                value={customStartDate}
                onChange={(event) => handleStartDateChange(event.target.value)}
                className="h-8 rounded border px-2 text-xs"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(event) => handleEndDateChange(event.target.value)}
                className="h-8 rounded border px-2 text-xs"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <span>
          Date Range: {dateRange.start} to {dateRange.end}
        </span>
        <span className="flex items-center gap-1">
          <RefreshCw className="h-3.5 w-3.5" />
          Auto refresh every 8 seconds
        </span>
      </div>

      {hasError && (
        <Card className="border-destructive/40">
          <CardContent className="py-4 text-sm text-destructive">
            Failed to load one or more report widgets. Please check API status and permissions.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              Revenue
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary?.total_revenue ?? 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              Transactions
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(summary?.total_transactions ?? 0).toLocaleString("en-US")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              Items Sold
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(summary?.total_items_sold ?? 0).toLocaleString("en-US")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              AOV
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary?.average_order_value ?? 0)}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Last update: {summary?.last_updated_at ?? "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className={consistency && consistency.total_mismatch > 0 ? "border-destructive/50" : "border-emerald-500/40"}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {consistency && consistency.total_mismatch > 0 ? (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            )}
            Data Consistency Health
          </CardTitle>
          <CardDescription>
            Reconciliation between sale header totals and sale items.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Checked: {(consistency?.total_checked ?? 0).toLocaleString("en-US")}</Badge>
            <Badge variant={consistency && consistency.total_mismatch > 0 ? "destructive" : "secondary"}>
              Mismatch: {(consistency?.total_mismatch ?? 0).toLocaleString("en-US")}
            </Badge>
            <span className="text-xs text-muted-foreground">Rate: {mismatchRate.toFixed(2)}%</span>
          </div>

          {consistency && consistency.data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Sale Total</TableHead>
                  <TableHead>Items Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consistency.data.map((issue) => (
                  <TableRow key={issue.sale_id}>
                    <TableCell>{issue.invoice_number || issue.sale_id}</TableCell>
                    <TableCell>{new Date(issue.created_at).toLocaleString("en-US")}</TableCell>
                    <TableCell>{formatCurrency(issue.sale_total)}</TableCell>
                    <TableCell>{formatCurrency(issue.items_total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {(!consistency || consistency.data.length === 0) && (
            <p className="text-sm text-muted-foreground">
              No mismatches found in selected period.
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Trend</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Sales Over Time</CardTitle>
              <CardDescription>
                {salesQuery.isFetching ? "Refreshing..." : "Updated automatically"} | Range: {salesRange}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {salesData.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sales data in selected period.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-full bg-sky-500" />
                      Total Sales
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                      Transactions
                    </span>
                  </div>

                  <div className="rounded-md border p-3">
                    <svg
                      width="100%"
                      height={salesLineChart.chartHeight}
                      viewBox={`0 0 ${salesLineChart.lineWidth} ${salesLineChart.chartHeight}`}
                      preserveAspectRatio="xMidYMid meet"
                      role="img"
                      aria-label="Sales trend line chart"
                    >
                      <line
                        x1={salesLineChart.chartStartX}
                        y1="12"
                        x2={salesLineChart.chartStartX}
                        y2={salesLineChart.chartHeight - 34}
                        stroke="hsl(var(--border))"
                        strokeWidth="1"
                      />
                      <line
                        x1={salesLineChart.chartEndX}
                        y1="12"
                        x2={salesLineChart.chartEndX}
                        y2={salesLineChart.chartHeight - 34}
                        stroke="hsl(var(--border))"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />
                      <line
                        x1={salesLineChart.chartStartX}
                        y1={salesLineChart.chartHeight - 34}
                        x2={salesLineChart.chartEndX}
                        y2={salesLineChart.chartHeight - 34}
                        stroke="hsl(var(--border))"
                        strokeWidth="1"
                      />

                      {salesLineChart.yTicks.map((tick) => (
                        <g key={`tick-${tick.y}`}>
                          <line
                            x1={salesLineChart.chartStartX}
                            y1={tick.y}
                            x2={salesLineChart.chartEndX}
                            y2={tick.y}
                            stroke="hsl(var(--border))"
                            strokeWidth="1"
                            strokeDasharray="2 3"
                          />
                          <text
                            x={salesLineChart.chartStartX - 8}
                            y={tick.y + 3}
                            textAnchor="end"
                            fontSize="10"
                            fill="hsl(var(--muted-foreground))"
                          >
                            {formatAxisNumber(tick.revenueValue)}
                          </text>
                          <text
                            x={salesLineChart.chartEndX + 8}
                            y={tick.y + 3}
                            textAnchor="start"
                            fontSize="10"
                            fill="hsl(var(--muted-foreground))"
                          >
                            {formatAxisNumber(tick.transactionValue)}
                          </text>
                        </g>
                      ))}

                      {salesLineChart.revenuePath && (
                        <path d={salesLineChart.revenuePath} fill="none" stroke="#0ea5e9" strokeWidth="2.5" />
                      )}
                      {salesLineChart.transactionPath && (
                        <path d={salesLineChart.transactionPath} fill="none" stroke="#22c55e" strokeWidth="2.5" />
                      )}

                      {salesLineChart.points.map((point) => (
                        <g key={point.period}>
                          <circle cx={point.x} cy={point.revenueY} r="2.8" fill="#0ea5e9" />
                          <circle cx={point.x} cy={point.transactionY} r="2.8" fill="#22c55e" />
                          {point.showLabel && (
                            <text
                              x={point.x}
                              y={salesLineChart.chartHeight - 14}
                              textAnchor="middle"
                              fontSize="10"
                              fill="hsl(var(--muted-foreground))"
                            >
                              {point.label}
                            </text>
                          )}
                        </g>
                      ))}

                      <text
                        x={(salesLineChart.chartStartX + salesLineChart.chartEndX) / 2}
                        y={salesLineChart.chartHeight - 2}
                        textAnchor="middle"
                        fontSize="11"
                        fill="hsl(var(--muted-foreground))"
                      >
                        X Axis (Period)
                      </text>
                      <text
                        x="14"
                        y={salesLineChart.chartHeight / 2}
                        transform={`rotate(-90 14 ${salesLineChart.chartHeight / 2})`}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#0ea5e9"
                      >
                        Y Axis (Total Sales)
                      </text>
                      <text
                        x={salesLineChart.lineWidth - 14}
                        y={salesLineChart.chartHeight / 2}
                        transform={`rotate(90 ${salesLineChart.lineWidth - 14} ${salesLineChart.chartHeight / 2})`}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#22c55e"
                      >
                        Y Axis (Transactions)
                      </text>
                    </svg>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction List</CardTitle>
              <CardDescription>
                Every invoice in selected period with quick detail drilldown.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading transactions...</p>
              ) : transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No transactions in selected period.</p>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Total Sales</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Sale Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.invoice_number}</TableCell>
                          <TableCell>{formatDateTime(transaction.created_at)}</TableCell>
                          <TableCell>{formatCurrency(transaction.total)}</TableCell>
                          <TableCell className="uppercase">{transaction.payment_method}</TableCell>
                          <TableCell>
                            <Badge variant={statusBadgeVariant(transaction.payment_status)} className="uppercase">
                              {transaction.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusBadgeVariant(transaction.status)} className="uppercase">
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTransactionID(transaction.id);
                                setDetailOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-muted-foreground">
                      Page {transactionPagination?.page ?? transactionPage} of {transactionPagination?.total_pages ?? 1}
                       | Total {transactionPagination?.total ?? transactions.length} transactions
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTransactionPage((current) => Math.max(1, current - 1))}
                        disabled={!(transactionPagination?.has_prev ?? false)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTransactionPage((current) => current + 1)}
                        disabled={!(transactionPagination?.has_next ?? false)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Ranked by quantity sold and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No product sales yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Qty Sold</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((product, index) => (
                      <TableRow key={product.product_id}>
                        <TableCell>#{index + 1}</TableCell>
                        <TableCell>{product.product_name}</TableCell>
                        <TableCell>{product.category_name || "-"}</TableCell>
                        <TableCell>{product.quantity_sold.toLocaleString("en-US")}</TableCell>
                        <TableCell>{formatCurrency(product.revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Distribution</CardTitle>
              <CardDescription>Revenue share by payment channel</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentMethods.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payment data available.</p>
              ) : (
                <div className="grid gap-5 lg:grid-cols-[200px_1fr]">
                  <div className="flex items-center justify-center">
                    <div
                      className="h-40 w-40 rounded-full border"
                      style={{ background: paymentChart }}
                    />
                  </div>

                  <div className="space-y-3">
                    {paymentMethods.map((item) => (
                      <div key={item.method} className="rounded-md border p-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="uppercase">
                            {item.method}
                          </Badge>
                          <span className="text-sm font-semibold">{item.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.total_transactions.toLocaleString("en-US")} tx
                          </span>
                          <span className="font-medium">{formatCurrency(item.total_revenue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Detail</DialogTitle>
            <DialogDescription>
              Complete invoice detail including cart items and payment info.
            </DialogDescription>
          </DialogHeader>

          {transactionDetailQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading transaction detail...</p>
          ) : !selectedTransaction ? (
            <p className="text-sm text-muted-foreground">Transaction detail unavailable.</p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Invoice Number</p>
                    <p className="text-lg font-semibold">{selectedTransaction.invoice_number}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusBadgeVariant(selectedTransaction.payment_status)} className="uppercase">
                      Payment: {selectedTransaction.payment_status}
                    </Badge>
                    <Badge variant={statusBadgeVariant(selectedTransaction.status)} className="uppercase">
                      Sale: {selectedTransaction.status}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <p className="text-muted-foreground">
                    Invoice Date & Time: <span className="font-medium text-foreground">{formatDateTime(selectedTransaction.created_at)}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Payment Method: <span className="font-medium uppercase text-foreground">{selectedTransaction.payment_method}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Outlet: <span className="font-medium text-foreground">{selectedTransaction.outlet?.name ?? "-"}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Cashier: <span className="font-medium text-foreground">{selectedTransaction.cashier?.name ?? "-"}</span>
                  </p>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <p className="mb-3 text-sm font-semibold">Cart Items</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedTransaction.items ?? []).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{item.product_sku}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell>{formatCurrency(item.discount_amount)}</TableCell>
                        <TableCell>{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 grid gap-1 text-sm sm:grid-cols-2">
                  <p className="text-muted-foreground">
                    Subtotal: <span className="font-medium text-foreground">{formatCurrency(selectedTransaction.subtotal)}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Discount: <span className="font-medium text-foreground">{formatCurrency(selectedTransaction.discount_amount)}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Tax: <span className="font-medium text-foreground">{formatCurrency(selectedTransaction.tax_amount)}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Total Sales: <span className="font-semibold text-foreground">{formatCurrency(selectedTransaction.total)}</span>
                  </p>
                </div>
              </div>

              <div className="rounded-lg border p-3 text-sm">
                <p className="mb-3 font-semibold">Payment Detail</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <p className="text-muted-foreground">
                    Method: <span className="font-medium uppercase text-foreground">{selectedTransaction.payment?.method ?? selectedTransaction.payment_method}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Amount: <span className="font-medium text-foreground">{formatCurrency(selectedTransaction.payment?.amount ?? selectedTransaction.total)}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Status: <span className="font-medium uppercase text-foreground">{selectedTransaction.payment?.status ?? selectedTransaction.payment_status}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Paid At: <span className="font-medium text-foreground">{selectedTransaction.payment?.paid_at ? formatDateTime(selectedTransaction.payment.paid_at) : "-"}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


