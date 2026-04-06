'use client';

import { useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateWarehouse, useUpdateWarehouse } from '../hooks/use-warehouses';
import type { Warehouse } from '../types/warehouse';

// Form schema
const warehouseSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50, 'Code must be at most 50 characters'),
  name: z.string().min(1, 'Name is required').max(200, 'Name must be at most 200 characters'),
  address: z.string().optional().nullable(),
  outlet_id: z.string().optional().nullable(),
  type: z.enum(['main', 'secondary', 'virtual']),
  status: z.enum(['active', 'inactive']),
  is_default: z.boolean(),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

interface WarehouseFormProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly warehouse?: Warehouse | null;
}

export function WarehouseForm({
  open,
  onOpenChange,
  warehouse,
}: WarehouseFormProps) {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const isEdit = !!warehouse;

  const createMutation = useCreateWarehouse();
  const updateMutation = useUpdateWarehouse();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      code: '',
      name: '',
      address: '',
      outlet_id: null,
      type: 'main' as const,
      status: 'active' as const,
      is_default: false,
    },
  });

  const isDefault = watch('is_default');

  // Reset form when warehouse changes
  useEffect(() => {
    if (warehouse && open) {
      reset({
        code: warehouse?.code ?? '',
        name: warehouse?.name ?? '',
        address: warehouse?.address ?? '',
        outlet_id: warehouse?.outlet_id ?? null,
        type: warehouse?.type === 'secondary' ? 'secondary' : warehouse?.type === 'virtual' ? 'virtual' : 'main',
        status: warehouse?.status === 'inactive' ? 'inactive' : 'active',
        is_default: warehouse?.is_default ?? false,
      });
    } else if (!warehouse && open) {
      reset({
        code: '',
        name: '',
        address: '',
        outlet_id: null,
        type: 'main' as const,
        status: 'active' as const,
        is_default: false,
      });
    }
  }, [warehouse, open, reset]);

  const onSubmit = async (data: WarehouseFormData) => {
    try {
      const payload = {
        code: data.code,
        name: data.name,
        address: data.address || null,
        outlet_id: data.outlet_id || null,
        type: data.type,
        status: data.status,
        is_default: data.is_default,
      };

      if (isEdit && warehouse?.id) {
        await updateMutation.mutateAsync({
          id: warehouse.id,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      onOpenChange(false);
    } catch (error) {
      // Error is handled by mutation hooks
      console.error('Form submission error:', error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('editWarehouse') : t('addWarehouse')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('editWarehouseDesc')
              : t('addWarehouseDesc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">
                  {t('warehouseCode')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  {...register('code')}
                  placeholder="WH-001"
                />
                {errors.code && (
                  <p className="text-sm text-destructive">{errors.code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  {t('warehouseName')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder={t('warehouseNamePlaceholder')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t('address')}</Label>
              <Textarea
                id="address"
                {...register('address')}
                placeholder={t('addressPlaceholder')}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">{t('warehouseType')}</Label>
                <Select
                  value={watch('type')}
                  onValueChange={(value) =>
                    setValue('type', value as 'main' | 'secondary' | 'virtual')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">{t('warehouseTypeMain')}</SelectItem>
                    <SelectItem value="secondary">{t('warehouseTypeSecondary')}</SelectItem>
                    <SelectItem value="virtual">{t('warehouseTypeVirtual')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">{t('status')}</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(value) =>
                    setValue('status', value as 'active' | 'inactive')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('active')}</SelectItem>
                    <SelectItem value="inactive">{t('inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('isDefaultWarehouse')}</Label>
                <p className="text-sm text-muted-foreground">{t('isDefaultWarehouseDesc')}</p>
              </div>
              <Switch
                checked={isDefault}
                onCheckedChange={(checked) => setValue('is_default', checked)}
              />
            </div>
          </div>

          {/* Actions */}
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
