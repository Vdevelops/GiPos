'use client';

import { useState } from 'react';
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
import { useOpenShift } from '../hooks/use-shifts';
import { rupiahToSen } from '@/lib/currency';

// Form schema
const shiftOpenSchema = z.object({
  outlet_id: z.string().min(1, 'Outlet ID is required'),
  opening_cash: z.number().min(0, 'Opening cash must be 0 or greater'),
  opening_notes: z.string().optional(),
});

type ShiftOpenFormData = z.infer<typeof shiftOpenSchema>;

interface ShiftOpenDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function ShiftOpenDialog({ open, onOpenChange }: ShiftOpenDialogProps) {
  const t = useTranslations('pos');
  const openShiftMutation = useOpenShift();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ShiftOpenFormData>({
    resolver: zodResolver(shiftOpenSchema),
    defaultValues: {
      outlet_id: 'default-outlet-id', // TODO: Get from context/store
      opening_cash: 0,
      opening_notes: '',
    },
  });

  const onSubmit = async (data: ShiftOpenFormData) => {
    try {
      await openShiftMutation.mutateAsync({
        outlet_id: data.outlet_id,
        opening_cash: rupiahToSen(data.opening_cash),
        opening_notes: data.opening_notes || null,
      });

      reset();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by mutation hook
      console.error('Shift open error:', error);
    }
  };

  const isLoading = openShiftMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('openShift')}</DialogTitle>
          <DialogDescription>
            {t('openShiftDesc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="opening_cash">
              {t('openingCash')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="opening_cash"
              type="number"
              step="0.01"
              {...register('opening_cash', { valueAsNumber: true })}
              placeholder="0"
            />
            {errors.opening_cash && (
              <p className="text-sm text-destructive">
                {errors.opening_cash.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="opening_notes">{t('openingNotes')}</Label>
            <Textarea
              id="opening_notes"
              {...register('opening_notes')}
              placeholder={t('openingNotesPlaceholder')}
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
              {t('openShift')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
