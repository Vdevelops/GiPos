'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, MoreVertical, Edit, Trash2, Warehouse as WarehouseIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useWarehouses, useDeleteWarehouse } from '../hooks/use-warehouses';
import { WarehouseForm } from './warehouse-form';
import { DeleteDialog } from '@/components/delete-dialog';
import type { Warehouse } from '../types/warehouse';

export function WarehouseList() {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [deletingWarehouse, setDeletingWarehouse] = useState<Warehouse | null>(null);

  const { data, isLoading, error } = useWarehouses({
    page,
    per_page: 20,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const deleteWarehouseMutation = useDeleteWarehouse();

  const warehouses = data?.data ?? [];
  const pagination = data?.pagination;

  const handleAddWarehouse = () => {
    setEditingWarehouse(null);
    setShowAddForm(true);
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setShowAddForm(true);
  };

  const handleDelete = async () => {
    if (deletingWarehouse?.id) {
      await deleteWarehouseMutation.mutateAsync(deletingWarehouse.id);
      setDeletingWarehouse(null);
    }
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingWarehouse(null);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : 'Failed to load warehouses'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('warehousesTitle')}</h2>
            <p className="text-muted-foreground">
              {pagination?.total ?? 0} warehouse{pagination?.total !== 1 ? 's' : ''} found
            </p>
          </div>
          <Button onClick={handleAddWarehouse}>
            <Plus className="mr-2 h-4 w-4" />
            {t('addWarehouse')}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('warehouses')}</CardTitle>
            <CardDescription>{t('warehousesDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : warehouses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <WarehouseIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('noWarehouses')}</p>
                <Button onClick={handleAddWarehouse} className="mt-4">
                  {t('addFirstWarehouse')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {warehouses.map((warehouse) => (
                  <div
                    key={warehouse?.id ?? 'unknown'}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <WarehouseIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{warehouse?.name ?? 'Unknown'}</h3>
                          {warehouse?.is_default && (
                            <Badge variant="default" className="text-xs">
                              Default
                            </Badge>
                          )}
                          <Badge
                            variant={
                              warehouse?.status === 'active' ? 'default' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {warehouse?.status === 'active' ? t('active') : t('inactive')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Code: {warehouse?.code ?? 'N/A'}
                          {warehouse?.outlet && ` • ${warehouse.outlet.name}`}
                        </p>
                        {warehouse?.address && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {warehouse.address}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditWarehouse(warehouse)}>
                          <Edit className="mr-2 h-4 w-4" />
                          {tCommon('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeletingWarehouse(warehouse)}
                          disabled={deleteWarehouseMutation.isPending}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {tCommon('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}

                {/* Pagination */}
                {pagination && pagination.total_pages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.total_pages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        {tCommon('previous')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((p) => Math.min(pagination.total_pages, p + 1))
                        }
                        disabled={page === pagination.total_pages}
                      >
                        {tCommon('next')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Warehouse Form Dialog */}
      <WarehouseForm
        open={showAddForm}
        onOpenChange={handleCloseForm}
        warehouse={editingWarehouse}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deletingWarehouse}
        onOpenChange={(open) => {
          if (!open) setDeletingWarehouse(null);
        }}
        onConfirm={handleDelete}
        itemName={deletingWarehouse?.name}
        isLoading={deleteWarehouseMutation.isPending}
      />
    </>
  );
}
