'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Search, MoreVertical, Edit, Trash2, Package, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts, useDeleteProduct } from '../hooks/use-products';
import { useCategories } from '../hooks/use-categories';
import { formatCurrency } from '@/lib/currency';
import { useDebounce } from '@/hooks/use-debounce';
import { DeleteDialog } from '@/components/delete-dialog';
import type { Product } from '../types';

interface ProductListProps {
  readonly onAddProduct: () => void;
  readonly onEditProduct: (product: Product) => void;
  readonly onViewProduct: (product: Product) => void;
}

export function ProductList({
  onAddProduct,
  onEditProduct,
  onViewProduct,
}: ProductListProps) {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const perPage = 20;

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch products
  const { data: productsData, isLoading } = useProducts({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
    status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
  });

  // Fetch categories for filter
  const { data: categoriesData } = useCategories({ per_page: 100 });

  const deleteProductMutation = useDeleteProduct();

  const products = productsData?.data ?? [];
  const categories = categoriesData?.data ?? [];
  const pagination = productsData?.meta?.pagination;

  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const handleDelete = async () => {
    if (deletingProduct?.id) {
      await deleteProductMutation.mutateAsync(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('productList')}</h2>
          <p className="text-muted-foreground">
            {pagination?.total ?? 0} {t('productsFound')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('stockUpdateHint')}
          </p>
        </div>
        <Button onClick={onAddProduct}>
          <Plus className="mr-2 h-4 w-4" />
          {t('addProduct')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('filterSearch')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCategories')}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category?.id ?? 'unknown'} value={category?.id ?? ''}>
                    {category?.name ?? 'Unknown'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="active">{t('active')}</SelectItem>
                <SelectItem value="inactive">{t('inactive')}</SelectItem>
                <SelectItem value="archived">{t('archived')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('products')}</CardTitle>
          <CardDescription>
            {pagination?.total ?? 0} {t('productsFound')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('noProducts')}</p>
              <Button variant="outline" className="mt-4" onClick={onAddProduct}>
                <Plus className="mr-2 h-4 w-4" />
                {t('addFirstProduct')}
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('product')}</TableHead>
                    <TableHead>{t('sku')}</TableHead>
                    <TableHead>{t('category')}</TableHead>
                    <TableHead>{t('price')}</TableHead>
                    <TableHead>{t('stock')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const stock = product?.stocks?.[0]?.quantity ?? 0;
                    const category = product?.category?.name ?? '-';
                    const status = product?.status ?? 'inactive';

                    return (
                      <TableRow key={product?.id ?? 'unknown'}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                              {product?.images?.[0]?.url ? (
                                <img
                                  src={product.images[0].url}
                                  alt={product.images[0]?.alt ?? product?.name ?? 'Product'}
                                  className="h-full w-full object-cover rounded-md"
                                />
                              ) : (
                                <Package className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">
                                {product?.name ?? 'Unknown Product'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {product?.sku ?? '-'}
                        </TableCell>
                        <TableCell>{category}</TableCell>
                        <TableCell>{formatCurrency(product?.price ?? 0)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={stock === 0 ? 'destructive' : 'secondary'}
                          >
                            {stock}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              status === 'active'
                                ? 'default'
                                : status === 'archived'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {status === 'active'
                              ? t('active')
                              : status === 'archived'
                              ? t('archived')
                              : t('inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onViewProduct(product)}>
                                <Eye className="mr-2 h-4 w-4" />
                                {tCommon('view')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEditProduct(product)}>
                                <Edit className="mr-2 h-4 w-4" />
                                {tCommon('edit')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeletingProduct(product)}
                                disabled={deleteProductMutation.isPending}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {tCommon('delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.total_pages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination.has_prev || page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!pagination.has_next || page === pagination.total_pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deletingProduct}
        onOpenChange={(open) => {
          if (!open) setDeletingProduct(null);
        }}
        onConfirm={handleDelete}
        itemName={deletingProduct?.name}
        isLoading={deleteProductMutation.isPending}
      />
    </div>
  );
}
