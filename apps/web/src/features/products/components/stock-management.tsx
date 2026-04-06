'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, AlertTriangle, Warehouse, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProducts } from '../hooks/use-products';
import { useProductStocks, useProductTotalStock } from '../hooks/use-inventory';
import { StockAdjustmentDialog } from './stock-adjustment-dialog';
import { formatCurrency } from '@/lib/currency';

interface StockManagementProps {
  readonly productId?: string | null;
}

export function StockManagement({ productId }: StockManagementProps) {
  const t = useTranslations('products');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(productId || null);
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  const [adjustingStockId, setAdjustingStockId] = useState<string | null>(null);

  // Fetch products for selector
  const { data: productsData } = useProducts({
    per_page: 100,
    status: 'active',
    sort_by: 'name',
  });

  // Fetch stocks for selected product
  const { data: stocksData, isLoading: isLoadingStocks } = useProductStocks(selectedProductId);
  const { data: totalStockData } = useProductTotalStock(selectedProductId);

  const products = productsData?.data ?? [];
  const stocks = stocksData?.data ?? [];
  const totalStock = totalStockData?.data;

  const handleAdjustStock = (stockId: string) => {
    setAdjustingStockId(stockId);
    setShowAdjustmentDialog(true);
  };

  const handleCloseAdjustment = () => {
    setShowAdjustmentDialog(false);
    setAdjustingStockId(null);
  };

  // Check for low stock alerts
  const lowStockItems = stocks.filter((stock) => {
    const available = (stock?.quantity ?? 0) - (stock?.reserved ?? 0);
    return stock?.min_stock && available <= stock.min_stock;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('stockManagement')}</h1>
          <p className="text-muted-foreground">
            {t('stockManagementDesc')}
          </p>
        </div>
      </div>

      {/* Product Selector */}
      <Card>
        <CardHeader>
          <CardTitle>{t('selectProduct')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedProductId || 'none'}
            onValueChange={(value) => setSelectedProductId(value === 'none' ? null : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('selectProductPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('allProducts')}</SelectItem>
              {products.map((product) => (
                <SelectItem key={product?.id ?? 'unknown'} value={product?.id ?? ''}>
                  {product?.name ?? 'Unknown'} ({product?.sku ?? '-'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              {t('lowStockAlerts')}
            </CardTitle>
            <CardDescription>
              {lowStockItems.length} {t('productsLowStock')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((stock) => {
                const available = (stock?.quantity ?? 0) - (stock?.reserved ?? 0);
                return (
                  <div
                    key={stock?.id ?? 'unknown'}
                    className="flex items-center justify-between p-3 border border-yellow-500 rounded-lg bg-yellow-50 dark:bg-yellow-950"
                  >
                    <div>
                      <p className="font-medium">
                        {stock?.warehouse?.name ?? 'Unknown Warehouse'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Available: {available} | Min Stock: {stock?.min_stock ?? 0}
                      </p>
                    </div>
                    <Badge variant="destructive">Low Stock</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Total Stock Summary */}
      {selectedProductId && totalStock && (
        <Card>
          <CardHeader>
            <CardTitle>{t('totalStockSummary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('totalQuantity')}</p>
                <p className="text-2xl font-bold">{totalStock.total_quantity ?? 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('totalReserved')}</p>
                <p className="text-2xl font-bold text-orange-600">
                  {totalStock.total_reserved ?? 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('available')}</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalStock.available ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock List */}
      {selectedProductId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('stockList')}</CardTitle>
                <CardDescription>
                  {stocks.length} warehouse{stocks.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <Button onClick={() => handleAdjustStock('new')}>
                <Plus className="mr-2 h-4 w-4" />
                {t('addStock')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStocks ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : stocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Warehouse className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('noStocks')}</p>
                <Button variant="outline" className="mt-4" onClick={() => handleAdjustStock('new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('addFirstStock')}
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('warehouse')}</TableHead>
                    <TableHead>{t('quantity')}</TableHead>
                    <TableHead>{t('reserved')}</TableHead>
                    <TableHead>{t('available')}</TableHead>
                    <TableHead>{t('minStock')}</TableHead>
                    <TableHead>{t('maxStock')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stocks.map((stock) => {
                    const available = (stock?.quantity ?? 0) - (stock?.reserved ?? 0);
                    const isLowStock =
                      stock?.min_stock && available <= stock.min_stock;

                    return (
                      <TableRow key={stock?.id ?? 'unknown'}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Warehouse className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {stock?.warehouse?.name ?? 'Unknown Warehouse'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{stock?.quantity ?? 0}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{stock?.reserved ?? 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={isLowStock ? 'destructive' : 'secondary'}
                          >
                            {available}
                          </Badge>
                        </TableCell>
                        <TableCell>{stock?.min_stock ?? 0}</TableCell>
                        <TableCell>{stock?.max_stock ?? 0}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAdjustStock(stock?.id ?? '')}
                          >
                            {t('adjust')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Adjustment Dialog */}
      <StockAdjustmentDialog
        open={showAdjustmentDialog}
        onOpenChange={handleCloseAdjustment}
        productId={selectedProductId}
        stockId={adjustingStockId === 'new' ? null : adjustingStockId}
      />
    </div>
  );
}
