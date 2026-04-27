"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  Eye,
  Package,
  Pencil,
  Plus,
  Save,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  useReportPaymentMethods,
  useReportProductSales,
  useReportSales,
  useReportSummary,
  useReportTransaction,
  useReportTransactions,
  useReportTopProducts,
  useUpdateReportTransaction,
} from "@/features/reports/hooks/use-reports";
import { useProducts } from "@/features/products/hooks/use-products";
import type {
  ProductSalesSortBy,
  ReportFilterQuery,
  ReportProductSalesQuery,
  ReportRange,
  ReportTransactionItem,
  ReportTransactionsQuery,
} from "@/features/reports/types/report";

type EditableTransactionItem = {
  rowID: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
};

type DatePreset = "today" | "monthly" | "yearly" | "date_range";
const TRANSACTION_PAGE_SIZE = 20;
const PRODUCT_SALES_PAGE_SIZE = 20;
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateRangePreset(
  preset: DatePreset,
  customStartDate: string,
  customEndDate: string
): { start: string; end: string } {
  const now = new Date();
  const today = formatDateOnly(now);

  if (preset === "today") {
    return { start: today, end: today };
  }

  if (preset === "monthly") {
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    return { start: formatDateOnly(monthStart), end: formatDateOnly(monthEnd) };
  }

  if (preset === "yearly") {
    const year = now.getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
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
  return new Date(value).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }) + " WIB";
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

function formatStatusLabel(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "completed") return "Selesai";
  if (normalized === "pending") return "Menunggu";
  if (normalized === "failed") return "Gagal";
  if (normalized === "cancelled") return "Dibatalkan";
  if (normalized === "refunded") return "Dikembalikan";
  return status;
}

function formatPaymentMethodLabel(method: string): string {
  const normalized = method.toLowerCase();
  if (normalized === "cash") return "Tunai";
  if (normalized === "qris") return "QRIS";
  return method.toUpperCase();
}

function toEditableItem(item: ReportTransactionItem): EditableTransactionItem {
  return {
    rowID: item.id,
    product_id: item.product_id,
    product_name: item.product_name,
    product_sku: item.product_sku,
    quantity: item.quantity,
    unit_price: item.unit_price,
    discount_amount: item.discount_amount,
  };
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

function formatAxisNumber(value: number, isCurrency?: boolean): string {
  const val = isCurrency ? value / 100 : value;

  if (val >= 1_000_000_000) {
    return `${(val / 1_000_000_000).toFixed(1)}M`;
  }
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(1)}Jt`;
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toFixed(1)}Rb`;
  }
  return val.toString();
}

function getPresetRangeForSelection(preset: DatePreset): { start: string; end: string } {
  return getDateRangePreset(preset, "", "");
}

export function ReportsAnalytics() {
  const now = new Date();
  const todayDate = formatDateOnly(now);
  const monthStartDate = formatDateOnly(
    new Date(now.getFullYear(), now.getMonth(), 1)
  );

  const [datePreset, setDatePreset] = useState<DatePreset>("monthly");
  const [customStartDate, setCustomStartDate] = useState<string>(monthStartDate);
  const [customEndDate, setCustomEndDate] = useState<string>(todayDate);
  const [transactionPage, setTransactionPage] = useState<number>(1);
  const [productSalesPage, setProductSalesPage] = useState<number>(1);
  const [productSalesSearch, setProductSalesSearch] = useState<string>("");
  const [productSalesSortBy, setProductSalesSortBy] = useState<ProductSalesSortBy>("quantity_sold");
  const [productSalesSortOrder, setProductSalesSortOrder] = useState<"asc" | "desc">("desc");
  const [detailOpen, setDetailOpen] = useState<boolean>(false);
  const [selectedTransactionID, setSelectedTransactionID] = useState<string | null>(null);
  const [isEditingTransaction, setIsEditingTransaction] = useState<boolean>(false);
  const [editedPaymentMethod, setEditedPaymentMethod] = useState<"cash" | "qris">("cash");
  const [editedItems, setEditedItems] = useState<EditableTransactionItem[]>([]);
  const [editedNotes, setEditedNotes] = useState<string>("");
  const [selectedProductIDToAdd, setSelectedProductIDToAdd] = useState<string>("");
  const [addProductQty, setAddProductQty] = useState<number>(1);

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

  const productSalesQueryParams = useMemo<ReportProductSalesQuery>(
    () => ({
      start_date: dateRange.start,
      end_date: dateRange.end,
      page: productSalesPage,
      per_page: PRODUCT_SALES_PAGE_SIZE,
      search: productSalesSearch || undefined,
      sort_by: productSalesSortBy,
      sort_order: productSalesSortOrder,
    }),
    [
      dateRange.end,
      dateRange.start,
      productSalesPage,
      productSalesSearch,
      productSalesSortBy,
      productSalesSortOrder,
    ]
  );

  useEffect(() => {
    setTransactionPage(1);
  }, [dateRange.end, dateRange.start]);

  useEffect(() => {
    setProductSalesPage(1);
  }, [dateRange.end, dateRange.start, productSalesSearch, productSalesSortBy, productSalesSortOrder]);

  const summaryQuery = useReportSummary(filterQuery);
  const salesQuery = useReportSales(salesRange, filterQuery);
  const topProductsQuery = useReportTopProducts(10, filterQuery);
  const productSalesQuery = useReportProductSales(productSalesQueryParams);
  const paymentMethodsQuery = useReportPaymentMethods(filterQuery);
  const transactionsQuery = useReportTransactions(transactionQuery);
  const transactionDetailQuery = useReportTransaction(detailOpen ? selectedTransactionID : null);
  const productsQuery = useProducts({ per_page: 200, status: "active", sort_by: "name", sort_order: "asc" });
  const updateTransactionMutation = useUpdateReportTransaction();

  const summary = summaryQuery.data?.success ? summaryQuery.data.data : undefined;
  const salesData = salesQuery.data?.success ? salesQuery.data.data?.data ?? [] : [];
  const topProducts = topProductsQuery.data?.success ? topProductsQuery.data.data?.data ?? [] : [];
  const productSalesReport = productSalesQuery.data?.success ? productSalesQuery.data.data : undefined;
  const productSales = productSalesReport?.data ?? [];
  const productSalesPagination = productSalesQuery.data?.meta?.pagination;
  const productSalesTotal = productSalesPagination?.total ?? productSalesReport?.total ?? productSales.length;
  const productSalesPerPage = productSalesPagination?.per_page ?? productSalesReport?.per_page ?? PRODUCT_SALES_PAGE_SIZE;
  const productSalesTotalPages = productSalesPagination?.total_pages ?? Math.max(1, Math.ceil(productSalesTotal / Math.max(productSalesPerPage, 1)));
  const productSalesCurrentPage = productSalesPagination?.page ?? productSalesReport?.page ?? productSalesPage;
  const productSalesHasPrev = productSalesPagination?.has_prev ?? productSalesCurrentPage > 1;
  const productSalesHasNext = productSalesPagination?.has_next ?? productSalesCurrentPage < productSalesTotalPages;
  const paymentMethods = paymentMethodsQuery.data?.success
    ? paymentMethodsQuery.data.data?.data ?? []
    : [];
  const transactions = transactionsQuery.data?.success
    ? transactionsQuery.data.data ?? []
    : [];
  const transactionPagination = transactionsQuery.data?.meta?.pagination;

  const selectedTransaction = transactionDetailQuery.data?.success
    ? transactionDetailQuery.data.data
    : transactions.find((item) => item.id === selectedTransactionID);

  const activeProducts = productsQuery.data?.success ? productsQuery.data.data ?? [] : [];
  const selectableProducts = useMemo(
    () => activeProducts.filter((product) => !editedItems.some((item) => item.product_id === product.id)),
    [activeProducts, editedItems]
  );

  const editedSubtotal = useMemo(
    () => editedItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0),
    [editedItems]
  );
  const editedDiscount = useMemo(
    () => editedItems.reduce((sum, item) => sum + item.discount_amount, 0),
    [editedItems]
  );
  const editedTotal = useMemo(
    () => Math.max(editedSubtotal - editedDiscount, 0),
    [editedDiscount, editedSubtotal]
  );

  useEffect(() => {
    if (!selectedTransaction || !detailOpen) {
      setIsEditingTransaction(false);
      setEditedItems([]);
      setEditedNotes("");
      setSelectedProductIDToAdd("");
      setAddProductQty(1);
      return;
    }

    setEditedPaymentMethod(
      (selectedTransaction.payment_method?.toLowerCase() === "qris" ? "qris" : "cash")
    );
    setEditedItems((selectedTransaction.items ?? []).map((item) => toEditableItem(item)));
    setEditedNotes(selectedTransaction.notes ?? "");
    setSelectedProductIDToAdd("");
    setAddProductQty(1);
  }, [detailOpen, selectedTransaction]);

  const handleUpdateItem = (
    rowID: string,
    field: "quantity" | "unit_price" | "discount_amount",
    value: number
  ) => {
    setEditedItems((current) =>
      current.map((item) => {
        if (item.rowID !== rowID) return item;

        if (field === "quantity") {
          return { ...item, quantity: Math.max(1, Math.floor(value) || 1) };
        }
        if (field === "unit_price") {
          return { ...item, unit_price: Math.max(0, Math.floor(value) || 0) };
        }
        return { ...item, discount_amount: Math.max(0, Math.floor(value) || 0) };
      })
    );
  };

  const handleAddItem = () => {
    if (!selectedProductIDToAdd) return;

    const product = activeProducts.find((entry) => entry.id === selectedProductIDToAdd);
    if (!product) return;

    setEditedItems((current) => [
      ...current,
      {
        rowID: `new-${product.id}`,
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        quantity: Math.max(1, Math.floor(addProductQty) || 1),
        unit_price: product.price,
        discount_amount: 0,
      },
    ]);
    setSelectedProductIDToAdd("");
    setAddProductQty(1);
  };

  const handleRemoveItem = (rowID: string) => {
    setEditedItems((current) => current.filter((item) => item.rowID !== rowID));
  };

  const handleSaveTransactionEdit = async () => {
    if (!selectedTransactionID || editedItems.length === 0) {
      return;
    }

    const response = await updateTransactionMutation.mutateAsync({
      id: selectedTransactionID,
      payload: {
        payment_method: editedPaymentMethod,
        notes: editedNotes,
        items: editedItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount,
        })),
      },
    });

    if (response.success) {
      setIsEditingTransaction(false);
    }
  };

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
    (productSalesQuery.data && !productSalesQuery.data.success) ||
    (paymentMethodsQuery.data && !paymentMethodsQuery.data.success) ||
    (transactionsQuery.data && !transactionsQuery.data.success);

  const qrisRevenue = useMemo(
    () =>
      paymentMethods
        .filter((item) => item.method.toLowerCase() === "qris")
        .reduce((sum, item) => sum + item.total_revenue, 0),
    [paymentMethods]
  );

  const cashRevenue = useMemo(
    () =>
      paymentMethods
        .filter((item) => item.method.toLowerCase() === "cash")
        .reduce((sum, item) => sum + item.total_revenue, 0),
    [paymentMethods]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Laporan & Analitik</h1>
          <p className="text-sm text-muted-foreground lg:text-base">
            Wawasan hampir real-time dari transaksi yang sudah selesai
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap xl:w-auto xl:justify-end">
          <Select value={datePreset} onValueChange={handleDatePresetChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="monthly">Bulanan</SelectItem>
              <SelectItem value="yearly">Tahunan</SelectItem>
              <SelectItem value="date_range">Rentang Tanggal</SelectItem>
            </SelectContent>
          </Select>

          {datePreset === "date_range" && (
            <div className="flex flex-col gap-2 rounded-md border bg-background px-2 py-2 sm:flex-row sm:items-center sm:gap-2 sm:py-1.5">
              <input
                type="date"
                value={customStartDate}
                onChange={(event) => handleStartDateChange(event.target.value)}
                className="h-8 w-full rounded border px-2 text-xs sm:w-auto"
              />
              <span className="text-xs text-muted-foreground">sampai</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(event) => handleEndDateChange(event.target.value)}
                className="h-8 w-full rounded border px-2 text-xs sm:w-auto"
              />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        Rentang Tanggal: {dateRange.start} sampai {dateRange.end}
      </div>

      {hasError && (
        <Card className="border-destructive/40">
          <CardContent className="py-4 text-sm text-destructive">
            Gagal memuat satu atau lebih widget laporan. Periksa status API dan izin akses.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              Pendapatan
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary?.total_revenue ?? 0)}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Pembaruan terakhir: {summary?.last_updated_at ? formatDateTime(summary.last_updated_at) : "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              Transaksi
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(summary?.total_transactions ?? 0).toLocaleString("id-ID")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              Item Terjual
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(summary?.total_items_sold ?? 0).toLocaleString("id-ID")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              Pendapatan QRIS
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(qrisRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              Pendapatan Tunai
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(cashRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto p-1">
          <TabsTrigger value="sales">Tren Penjualan</TabsTrigger>
          <TabsTrigger value="products">Produk Terlaris</TabsTrigger>
          <TabsTrigger value="product-sales">Penjualan Produk</TabsTrigger>
          <TabsTrigger value="payments">Metode Pembayaran</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Penjualan dari Waktu ke Waktu</CardTitle>
              <CardDescription>
                {salesQuery.isFetching ? "Memperbarui..." : "Data terbaru saat halaman dibuka"} | Rentang: {salesRange}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {salesData.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada data penjualan pada periode terpilih.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-full bg-sky-500" />
                      Total Penjualan
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                      Transaksi
                    </span>
                  </div>

                  <div className="w-full overflow-x-auto rounded-md border p-3">
                    <svg
                      width="100%"
                      height={salesLineChart.chartHeight}
                      viewBox={`0 0 ${salesLineChart.lineWidth} ${salesLineChart.chartHeight}`}
                      preserveAspectRatio="xMidYMid meet"
                      role="img"
                      aria-label="Grafik garis tren penjualan"
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
                            {formatAxisNumber(tick.revenueValue, true)}
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
                        Sumbu X (Periode)
                      </text>
                      <text
                        x="14"
                        y={salesLineChart.chartHeight / 2}
                        transform={`rotate(-90 14 ${salesLineChart.chartHeight / 2})`}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#0ea5e9"
                      >
                        Sumbu Y (Total Penjualan)
                      </text>
                      <text
                        x={salesLineChart.lineWidth - 14}
                        y={salesLineChart.chartHeight / 2}
                        transform={`rotate(90 ${salesLineChart.lineWidth - 14} ${salesLineChart.chartHeight / 2})`}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#22c55e"
                      >
                        Sumbu Y (Transaksi)
                      </text>
                    </svg>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daftar Transaksi</CardTitle>
              <CardDescription>
                Semua invoice pada periode terpilih dengan akses detail cepat.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Memuat data transaksi...</p>
              ) : transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada transaksi pada periode terpilih.</p>
              ) : (
                <div className="space-y-4">
                  <div className="w-full overflow-x-auto">
                    <Table className="min-w-[900px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice</TableHead>
                          <TableHead>Tanggal & Waktu</TableHead>
                          <TableHead>Total Penjualan</TableHead>
                          <TableHead>Metode Bayar</TableHead>
                          <TableHead>Status Pembayaran</TableHead>
                          <TableHead>Status Penjualan</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">{transaction.invoice_number}</TableCell>
                            <TableCell>{formatDateTime(transaction.created_at)}</TableCell>
                            <TableCell>{formatCurrency(transaction.total)}</TableCell>
                            <TableCell className="uppercase">{formatPaymentMethodLabel(transaction.payment_method)}</TableCell>
                            <TableCell>
                              <Badge variant={statusBadgeVariant(transaction.payment_status)} className="uppercase">
                                {formatStatusLabel(transaction.payment_status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusBadgeVariant(transaction.status)} className="uppercase">
                                {formatStatusLabel(transaction.status)}
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
                  </div>

                  <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-muted-foreground">
                      Halaman {transactionPagination?.page ?? transactionPage} dari {transactionPagination?.total_pages ?? 1}
                       | Total {transactionPagination?.total ?? transactions.length} transaksi
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTransactionPage((current) => Math.max(1, current - 1))}
                        disabled={!(transactionPagination?.has_prev ?? false)}
                      >
                        Sebelumnya
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTransactionPage((current) => current + 1)}
                        disabled={!(transactionPagination?.has_next ?? false)}
                      >
                        Selanjutnya
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
              <CardTitle>Produk Paling Laris</CardTitle>
              <CardDescription>Peringkat teratas berdasarkan jumlah terjual dan pendapatan</CardDescription>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada data penjualan produk.</p>
              ) : (
                <div className="w-full overflow-x-auto">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Produk</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Qty Terjual</TableHead>
                        <TableHead>Pendapatan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topProducts.map((product, index) => (
                        <TableRow key={product.product_id}>
                          <TableCell>#{index + 1}</TableCell>
                          <TableCell>{product.product_name}</TableCell>
                          <TableCell>{product.category_name || "-"}</TableCell>
                          <TableCell>{product.quantity_sold.toLocaleString("id-ID")}</TableCell>
                          <TableCell>{formatCurrency(product.revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="product-sales">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Penjualan Produk</CardTitle>
              <CardDescription>
                Daftar lengkap produk termasuk yang belum terjual pada periode terpilih.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid gap-2 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
                <Input
                  value={productSalesSearch}
                  onChange={(event) => setProductSalesSearch(event.target.value)}
                  placeholder="Cari berdasarkan nama produk atau SKU"
                />

                <Select
                  value={productSalesSortBy}
                  onValueChange={(value) => setProductSalesSortBy(value as ProductSalesSortBy)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quantity_sold">Jumlah Terjual</SelectItem>
                    <SelectItem value="revenue">Pendapatan</SelectItem>
                    <SelectItem value="product_name">Nama Produk</SelectItem>
                    <SelectItem value="product_sku">SKU</SelectItem>
                    <SelectItem value="product_status">Status</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={productSalesSortOrder}
                  onValueChange={(value) => setProductSalesSortOrder(value as "asc" | "desc")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Arah Urutan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Menurun</SelectItem>
                    <SelectItem value="asc">Menaik</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {productSalesQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Memuat laporan penjualan produk...</p>
              ) : productSales.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada produk untuk filter terpilih.</p>
              ) : (
                <div className="space-y-4">
                  <div className="w-full overflow-x-auto">
                    <Table className="min-w-[820px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produk</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead>Qty Terjual</TableHead>
                          <TableHead>Pendapatan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productSales.map((product) => (
                          <TableRow key={product.product_id}>
                            <TableCell className="font-medium">{product.product_name}</TableCell>
                            <TableCell>{product.product_sku || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="uppercase">
                                {product.product_status || "tidak diketahui"}
                              </Badge>
                            </TableCell>
                            <TableCell>{product.category_name || "-"}</TableCell>
                            <TableCell>{product.quantity_sold.toLocaleString("id-ID")}</TableCell>
                            <TableCell>{formatCurrency(product.revenue)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-muted-foreground">
                      Halaman {productSalesCurrentPage} dari {productSalesTotalPages}
                      {" | "}
                      Total {productSalesTotal.toLocaleString("id-ID")} produk
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setProductSalesPage((current) => Math.max(1, current - 1))}
                        disabled={!productSalesHasPrev}
                      >
                        Sebelumnya
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setProductSalesPage((current) => current + 1)}
                        disabled={!productSalesHasNext}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Metode Pembayaran</CardTitle>
              <CardDescription>Kontribusi pendapatan per kanal pembayaran</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentMethods.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada data pembayaran.</p>
              ) : (
                <div className="grid gap-5 xl:grid-cols-[200px_1fr]">
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
                            {formatPaymentMethodLabel(item.method)}
                          </Badge>
                          <span className="text-sm font-semibold">{item.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.total_transactions.toLocaleString("id-ID")} transaksi
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

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setIsEditingTransaction(false);
          }
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl lg:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
            <DialogDescription>
              Detail invoice lengkap termasuk item keranjang dan informasi pembayaran.
            </DialogDescription>
          </DialogHeader>

          {transactionDetailQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Memuat detail transaksi...</p>
          ) : !selectedTransaction ? (
            <p className="text-sm text-muted-foreground">Detail transaksi tidak tersedia.</p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Nomor Invoice</p>
                    <p className="text-lg font-semibold">{selectedTransaction.invoice_number}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusBadgeVariant(selectedTransaction.payment_status)} className="uppercase">
                      Bayar: {formatStatusLabel(selectedTransaction.payment_status)}
                    </Badge>
                    <Badge variant={statusBadgeVariant(selectedTransaction.status)} className="uppercase">
                      Jual: {formatStatusLabel(selectedTransaction.status)}
                    </Badge>
                    {!isEditingTransaction ? (
                      <Button variant="outline" size="sm" onClick={() => setIsEditingTransaction(true)}>
                        <Pencil className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingTransaction(false)}
                          disabled={updateTransactionMutation.isPending}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Batal
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveTransactionEdit}
                          disabled={updateTransactionMutation.isPending || editedItems.length === 0}
                        >
                          <Save className="mr-1 h-4 w-4" />
                          {updateTransactionMutation.isPending ? "Menyimpan..." : "Simpan"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <p className="text-muted-foreground">
                    Tanggal & Waktu Invoice: <span className="font-medium text-foreground">{formatDateTime(selectedTransaction.created_at)}</span>
                  </p>
                  {isEditingTransaction ? (
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Metode Pembayaran</p>
                      <Select
                        value={editedPaymentMethod}
                        onValueChange={(value) => setEditedPaymentMethod(value as "cash" | "qris")}
                      >
                        <SelectTrigger className="h-8 w-full sm:w-[180px]">
                          <SelectValue placeholder="Pilih metode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Tunai</SelectItem>
                          <SelectItem value="qris">QRIS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Metode Pembayaran: <span className="font-medium uppercase text-foreground">{formatPaymentMethodLabel(selectedTransaction.payment_method)}</span>
                    </p>
                  )}
                  <p className="text-muted-foreground">
                    Outlet: <span className="font-medium text-foreground">{selectedTransaction.outlet?.name ?? "-"}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Kasir: <span className="font-medium text-foreground">{selectedTransaction.cashier?.name ?? "-"}</span>
                  </p>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <p className="mb-3 text-sm font-semibold">Item Keranjang</p>
                <div className="w-full overflow-x-auto">
                  <Table className="min-w-[760px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produk</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Harga Satuan</TableHead>
                        <TableHead>Diskon</TableHead>
                        <TableHead>Total</TableHead>
                        {isEditingTransaction && <TableHead className="text-right">Aksi</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(isEditingTransaction ? editedItems : (selectedTransaction.items ?? []).map((item) => toEditableItem(item))).map((item) => (
                        <TableRow key={item.rowID}>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell>{item.product_sku}</TableCell>
                          <TableCell>
                            {isEditingTransaction ? (
                              <Input
                                type="number"
                                className="h-8 w-20"
                                min={1}
                                value={item.quantity}
                                onChange={(event) => handleUpdateItem(item.rowID, "quantity", Number(event.target.value))}
                              />
                            ) : (
                              item.quantity
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditingTransaction ? (
                              <Input
                                type="number"
                                className="h-8 w-32"
                                min={0}
                                value={item.unit_price}
                                onChange={(event) => handleUpdateItem(item.rowID, "unit_price", Number(event.target.value))}
                              />
                            ) : (
                              formatCurrency(item.unit_price)
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditingTransaction ? (
                              <Input
                                type="number"
                                className="h-8 w-32"
                                min={0}
                                value={item.discount_amount}
                                onChange={(event) => handleUpdateItem(item.rowID, "discount_amount", Number(event.target.value))}
                              />
                            ) : (
                              formatCurrency(item.discount_amount)
                            )}
                          </TableCell>
                          <TableCell>{formatCurrency(Math.max(item.quantity * item.unit_price - item.discount_amount, 0))}</TableCell>
                          {isEditingTransaction && (
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.rowID)}
                                disabled={editedItems.length <= 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {isEditingTransaction && (
                  <div className="mt-3 grid gap-2 rounded-md border p-3 lg:grid-cols-[minmax(0,1fr)_120px_auto]">
                    <Select value={selectedProductIDToAdd} onValueChange={setSelectedProductIDToAdd}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih produk untuk ditambahkan" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectableProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={1}
                      value={addProductQty}
                      onChange={(event) => setAddProductQty(Math.max(1, Number(event.target.value) || 1))}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddItem}
                      disabled={!selectedProductIDToAdd}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Tambah Item
                    </Button>
                  </div>
                )}

                <div className="mt-4 grid gap-1 text-sm sm:grid-cols-2">
                  <p className="text-muted-foreground">
                    Subtotal: <span className="font-medium text-foreground">{formatCurrency(isEditingTransaction ? editedSubtotal : selectedTransaction.subtotal)}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Diskon: <span className="font-medium text-foreground">{formatCurrency(isEditingTransaction ? editedDiscount : selectedTransaction.discount_amount)}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Pajak: <span className="font-medium text-foreground">{formatCurrency(selectedTransaction.tax_amount)}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Total Penjualan: <span className="font-semibold text-foreground">{formatCurrency(isEditingTransaction ? editedTotal : selectedTransaction.total)}</span>
                  </p>
                </div>

                {isEditingTransaction && (
                  <div className="mt-3">
                    <p className="mb-1 text-xs text-muted-foreground">Catatan Transaksi</p>
                    <Input
                      value={editedNotes}
                      onChange={(event) => setEditedNotes(event.target.value)}
                      placeholder="Tambahkan catatan perubahan transaksi"
                    />
                  </div>
                )}
              </div>

              <div className="rounded-lg border p-3 text-sm">
                <p className="mb-3 font-semibold">Detail Pembayaran</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <p className="text-muted-foreground">
                    Metode: <span className="font-medium uppercase text-foreground">{formatPaymentMethodLabel(isEditingTransaction ? editedPaymentMethod : (selectedTransaction.payment?.method ?? selectedTransaction.payment_method))}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Jumlah: <span className="font-medium text-foreground">{formatCurrency(isEditingTransaction ? editedTotal : (selectedTransaction.payment?.amount ?? selectedTransaction.total))}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Status: <span className="font-medium uppercase text-foreground">{formatStatusLabel(selectedTransaction.payment?.status ?? selectedTransaction.payment_status)}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Dibayar Pada: <span className="font-medium text-foreground">{selectedTransaction.payment?.paid_at ? formatDateTime(selectedTransaction.payment.paid_at) : "-"}</span>
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


