'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStock } from '../hooks/use-inventory';
import {
  useCreateProductStock,
  useUpdateProductStock,
} from '../hooks/use-inventory';
import { useProducts } from '../hooks/use-products';

// Form schema
const stockAdjustmentSchema = z.object({
  warehouse_id: z.string().min(1, 'Warehouse is required'),
  quantity: z.number().min(0, 'Quantity must be 0 or greater'),
  reserved: z.number().min(0, 'Reserved must be 0 or greater'),
  min_stock: z.number().min(0, 'Min stock must be 0 or greater'),
  max_stock: z.number().min(0, 'Max stock must be 0 or greater').optional(),
});

type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;

interface StockAdjustmentDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly productId: string | null;
  readonly stockId: string | null;
}

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  productId,
  stockId,
}: StockAdjustmentDialogProps) {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const isEdit = !!stockId;

  // Fetch stock if editing
  const { data: stockData } = useStock(stockId);
  const stock = stockData?.data;

  // Fetch product to get available warehouses (for now, we'll use a placeholder)
  // TODO: Implement warehouse service when available
  const warehouses = [
    { id: 'warehouse-1', name: 'Main Warehouse' },
    { id: 'warehouse-2', name: 'Branch Warehouse A' },
  ];

  const createMutation = useCreateProductStock();
  const updateMutation = useUpdateProductStock();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      warehouse_id: '',
      quantity: 0,
      reserved: 0,
      min_stock: 0,
      max_stock: undefined,
    },
  });

  // Reset form when stock changes
  useEffect(() => {
    if (stock && open) {
      reset({
        warehouse_id: stock?.warehouse_id ?? '',
        quantity: stock?.quantity ?? 0,
        reserved: stock?.reserved ?? 0,
        min_stock: stock?.min_stock ?? 0,
        max_stock: stock?.max_stock ?? undefined,
      });
    } else if (!stock && open) {
      reset({
        warehouse_id: '',
        quantity: 0,
        reserved: 0,
        min_stock: 0,
        max_stock: undefined,
      });
    }
  }, [stock, open, reset]);

  const onSubmit = async (data: StockAdjustmentFormData) => {
    if (!productId) {
      return;
    }

    try {
      if (isEdit && stockId) {
        await updateMutation.mutateAsync({
          id: stockId,
          data: {
            quantity: data.quantity,
            reserved: data.reserved,
            min_stock: data.min_stock,
            max_stock: data.max_stock,
          },
        });
      } else {
        await createMutation.mutateAsync({
          productId,
          data: {
            warehouse_id: data.warehouse_id,
            quantity: data.quantity,
            reserved: data.reserved,
            min_stock: data.min_stock,
            max_stock: data.max_stock,
          },
        });
      }

      onOpenChange(false);
    } catch (error) {
      // Error is handled by mutation hooks
      console.error('Stock adjustment error:', error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const reserved = watch('reserved');
  const quantity = watch('quantity');
  const available = quantity - reserved;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('adjustStock') : t('addStock')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('adjustStockDesc')
              : t('addStockDesc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="warehouse_id">
                {t('warehouse')} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch('warehouse_id')}
                onValueChange={(value) => setValue('warehouse_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectWarehouse')} />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.warehouse_id && (
                <p className="text-sm text-destructive">
                  {errors.warehouse_id.message}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">
                {t('quantity')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                {...register('quantity', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reserved">{t('reserved')}</Label>
              <Input
                id="reserved"
                type="number"
                {...register('reserved', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.reserved && (
                <p className="text-sm text-destructive">{errors.reserved.message}</p>
              )}
            </div>
          </div>

          {quantity > 0 && (
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t('available')}</span>
                <span
                  className={`font-semibold ${
                    available < 0 ? 'text-destructive' : 'text-green-600'
                  }`}
                >
                  {available}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_stock">{t('minStock')}</Label>
              <Input
                id="min_stock"
                type="number"
                {...register('min_stock', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_stock">{t('maxStock')}</Label>
              <Input
                id="max_stock"
                type="number"
                {...register('max_stock', { valueAsNumber: true, setValueAs: (v) => (v === '' ? undefined : Number(v)) })}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? tCommon('update') : tCommon('create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
