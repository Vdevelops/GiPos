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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useShift, useCloseShift } from '../hooks/use-shifts';
import { formatCurrency } from '@/lib/currency';
import { rupiahToSen } from '@/lib/currency';

// Form schema
const shiftCloseSchema = z.object({
  closing_cash: z.number().min(0, 'Closing cash must be 0 or greater'),
  closing_notes: z.string().optional(),
});

type ShiftCloseFormData = z.infer<typeof shiftCloseSchema>;

interface ShiftCloseDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly shiftId: string;
}

export function ShiftCloseDialog({
  open,
  onOpenChange,
  shiftId,
}: ShiftCloseDialogProps) {
  const t = useTranslations('pos');
  const { data: shiftData } = useShift(shiftId);
  const closeShiftMutation = useCloseShift();

  const shift = shiftData?.data;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ShiftCloseFormData>({
    resolver: zodResolver(shiftCloseSchema),
    defaultValues: {
      closing_cash: 0,
      closing_notes: '',
    },
  });

  const closingCash = watch('closing_cash');
  const expectedCash = shift?.expected_cash ?? 0;
  const difference = closingCash ? rupiahToSen(closingCash) - expectedCash : 0;

  const onSubmit = async (data: ShiftCloseFormData) => {
    try {
      await closeShiftMutation.mutateAsync({
        id: shiftId,
        data: {
          closing_cash: rupiahToSen(data.closing_cash),
          closing_notes: data.closing_notes || null,
        },
      });

      reset();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by mutation hook
      console.error('Shift close error:', error);
    }
  };

  const isLoading = closeShiftMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('closeShift')}</DialogTitle>
          <DialogDescription>
            {t('closeShiftDesc')}
          </DialogDescription>
        </DialogHeader>

        {shift && (
          <div className="space-y-4">
            {/* Shift Summary */}
            <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('openingCash')}</span>
                <span className="font-medium">
                  {formatCurrency(shift?.opening_cash ?? 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('totalSales')}</span>
                <span className="font-medium text-success">
                  {formatCurrency(shift?.total_sales ?? 0)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>{t('expectedCash')}</span>
                <span>{formatCurrency(shift?.expected_cash ?? 0)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="closing_cash">
                  {t('closingCash')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="closing_cash"
                  type="number"
                  step="0.01"
                  {...register('closing_cash', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.closing_cash && (
                  <p className="text-sm text-destructive">
                    {errors.closing_cash.message}
                  </p>
                )}
              </div>

              {closingCash > 0 && (
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('difference')}</span>
                    <span
                      className={`font-semibold ${
                        difference >= 0 ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {formatCurrency(difference)}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="closing_notes">{t('closingNotes')}</Label>
                <Textarea
                  id="closing_notes"
                  {...register('closing_notes')}
                  placeholder={t('closingNotesPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('closeShift')}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
