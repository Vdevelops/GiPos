'use client';

import { useMemo, useState } from 'react';
import { Banknote, QrCode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { formatCurrency, rupiahToSen, senToRupiah } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

type PaymentMethod = 'cash' | 'qris';

interface PaymentSectionProps {
  readonly subtotal: number;
  readonly discountAmount?: number;
  readonly discountPercent?: number;
  readonly isDiscountAvailable?: boolean;
  readonly isDiscountEnabled?: boolean;
  readonly onDiscountEnabledChange?: (enabled: boolean) => void;
  readonly isDiscountToggleDisabled?: boolean;
  readonly total: number;
  readonly itemCount: number;
  readonly isLoading?: boolean;
  readonly hasPendingSale?: boolean;
  readonly pendingReference?: string;
  readonly onPayCash: (amountPaid: number) => Promise<void> | void;
  readonly onPayQris: () => Promise<void> | void;
  readonly className?: string;
  readonly contentClassName?: string;
}

export function PaymentSection({
  subtotal,
  discountAmount = 0,
  discountPercent = 0,
  isDiscountAvailable = false,
  isDiscountEnabled = false,
  onDiscountEnabledChange,
  isDiscountToggleDisabled = false,
  total,
  itemCount,
  isLoading = false,
  hasPendingSale = false,
  pendingReference,
  onPayCash,
  onPayQris,
  className,
  contentClassName,
}: PaymentSectionProps) {
  const t = useTranslations('pos');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [cashReceived, setCashReceived] = useState('');

  const amountPaid = useMemo(() => {
    const value = Number(cashReceived || 0);
    return rupiahToSen(Number.isFinite(value) ? value : 0);
  }, [cashReceived]);

  const change = amountPaid - total;

  const setExactCash = () => {
    setCashReceived(String(senToRupiah(total)));
  };

  const handlePayCash = async () => {
    if (amountPaid < total) {
      return;
    }

    try {
      await onPayCash(amountPaid);
      setCashReceived('');
    } catch (error) {
      console.error('Cash payment failed:', error);
    }
  };

  const handlePayQris = async () => {
    try {
      await onPayQris();
    } catch (error) {
      console.error('QRIS payment failed:', error);
    }
  };

  return (
    <div className={cn('shrink-0 px-4 py-3', className)}>
      <div className="space-y-1 border-b pb-3">
        <h3 className="text-lg font-semibold md:text-xl">{t('payment')}</h3>
        {hasPendingSale && (
          <p className="text-sm text-muted-foreground md:text-base">
            {t('pendingSaleNotice', {
              reference: pendingReference || '-',
            })}
          </p>
        )}
      </div>

      <div className={cn('flex min-h-0 flex-col gap-3 pt-3 md:gap-4', contentClassName)}>
        <div className="flex items-center justify-between py-1">
          <p className="text-sm font-semibold md:text-base">{t('wednesdayDiscount')}</p>
          <Switch
            checked={isDiscountEnabled}
            onCheckedChange={onDiscountEnabledChange}
            disabled={isDiscountToggleDisabled}
            aria-label={t('wednesdayDiscount')}
            className="h-5 w-10 border border-foreground/20 data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-slate-300 dark:data-[state=checked]:bg-emerald-500 dark:data-[state=unchecked]:bg-slate-700 md:h-6 md:w-11"
          />
        </div>
        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-base md:text-lg">
            <span className="text-muted-foreground">{t('itemCount')}</span>
            <span>{itemCount}</span>
          </div>
          <div className="flex justify-between text-base md:text-lg">
            <span className="text-muted-foreground">{t('subtotal')}</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-base text-green-700 md:text-lg">
              <span>{t('discount', { percent: discountPercent })}</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-xl font-bold md:text-2xl">
            <span>{t('total')}</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
        <Separator />

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={method === 'cash' ? 'default' : 'outline'}
            className="h-10 text-sm font-semibold md:h-12 md:text-lg"
            onClick={() => setMethod('cash')}
            disabled={isLoading}
          >
            <Banknote className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            {t('cash')}
          </Button>
          <Button
            type="button"
            variant={method === 'qris' ? 'default' : 'outline'}
            className="h-10 text-sm font-semibold md:h-12 md:text-lg"
            onClick={() => setMethod('qris')}
            disabled={isLoading}
          >
            <QrCode className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            {t('qris')}
          </Button>
        </div>

        {method === 'cash' && (
          <div className="space-y-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              className="h-10 w-full text-sm font-semibold md:h-12 md:text-lg"
              onClick={setExactCash}
              disabled={isLoading}
            >
              {t('exactCash')}
            </Button>

            <div className="space-y-2">
              <Label htmlFor="amount-paid" className="text-sm font-medium md:text-base">
                {t('amountPaid')}
              </Label>
              <Input
                id="amount-paid"
                type="number"
                min={0}
                step={1}
                value={cashReceived}
                onChange={(event) => setCashReceived(event.target.value)}
                placeholder="0"
                className="h-10 text-sm md:h-12 md:text-lg"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between text-base md:text-lg">
              <span className="text-muted-foreground">{t('change')}</span>
              <span className={cn('font-medium', change < 0 ? 'text-destructive' : 'text-green-600')}>
                {change >= 0 ? formatCurrency(change) : t('insufficientAmount')}
              </span>
            </div>

            <Button
              type="button"
              className="h-10 w-full text-sm font-semibold md:h-12 md:text-lg"
              onClick={() => {
                void handlePayCash();
              }}
              disabled={isLoading || amountPaid < total || total <= 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin md:h-5 md:w-5" />
                  {t('processing')}
                </>
              ) : (
                t('payCashNow')
              )}
            </Button>
          </div>
        )}

        {method === 'qris' && (
          <div className="space-y-3 pt-1">
            <p className="text-base text-muted-foreground md:text-lg">{t('qrisInlineDescription')}</p>
            <Button
              type="button"
              className="h-10 w-full text-sm font-semibold md:h-12 md:text-lg"
              onClick={() => {
                void handlePayQris();
              }}
              disabled={isLoading || total <= 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin md:h-5 md:w-5" />
                  {t('processing')}
                </>
              ) : (
                t('payNow')
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
