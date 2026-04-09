'use client';

import { useMemo, useState } from 'react';
import { Banknote, QrCode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <div className={cn('shrink-0 px-5 py-4 md:px-6 md:py-5', className)}>
      <div className="space-y-2 border-b pb-4">
        <h3 className="text-xl font-bold tracking-tight md:text-2xl">{t('payment')}</h3>
        {hasPendingSale && (
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            {t('pendingSaleNotice', {
              reference: pendingReference || '-',
            })}
          </p>
        )}
      </div>

      <div className={cn('grid min-h-0 grid-cols-1 gap-10 pt-4 md:grid-cols-2 md:gap-x-10 lg:gap-x-10', contentClassName)}>
        <div className="space-y-4 md:pr-2">
          <div className="flex items-center justify-between py-1.5">
            <p className="text-base font-semibold md:text-lg">{t('wednesdayDiscount')}</p>
            <Switch
              checked={isDiscountEnabled}
              onCheckedChange={onDiscountEnabledChange}
              disabled={isDiscountToggleDisabled}
              aria-label={t('wednesdayDiscount')}
              className="h-7 w-14 border border-border data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/35 md:h-8 md:w-16"
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
              <div className="flex justify-between text-sm text-success md:text-base">
                <span>{t('discount', { percent: discountPercent })}</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-xl font-bold md:text-2xl">
              <span>{t('total')}</span>
              <span>{formatCurrency(total)}</span>
            </div>
            {method === 'cash' && (
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-muted-foreground">{t('change')}</span>
                <span className={cn('font-medium', change < 0 ? 'text-destructive' : 'text-success')}>
                  {change >= 0 ? formatCurrency(change) : t('insufficientAmount')}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 md:border-l md:border-border/70 md:pl-4 lg:pl-5">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={method === 'cash' ? 'default' : 'outline'}
              className="h-10 !text-lg font-semibold md:h-11 md:!text-xl"
              onClick={() => setMethod('cash')}
              disabled={isLoading}
            >
              <Banknote className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              {t('cash')}
            </Button>
            <Button
              type="button"
              variant={method === 'qris' ? 'default' : 'outline'}
              className="h-10 !text-lg font-semibold md:h-11 md:!text-xl"
              onClick={() => setMethod('qris')}
              disabled={isLoading}
            >
              <QrCode className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              {t('qris')}
            </Button>
          </div>

          {method === 'cash' && (
            <div className="space-y-4 pt-1">
              <div className="flex flex-col gap-3">
                <p className="text-base font-semibold md:text-xl">{t('amountPaid')}</p>
                <Input
                  id="amount-paid"
                  type="number"
                  min={0}
                  step={1}
                  value={cashReceived}
                  onChange={(event) => setCashReceived(event.target.value)}
                  placeholder={t('amountPaid')}
                  className="h-12 !text-lg placeholder:text-sm md:h-14 md:!text-2xl md:placeholder:text-lg"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 w-full px-3 !text-base font-semibold md:h-11 md:!text-lg"
                  onClick={setExactCash}
                  disabled={isLoading}
                >
                  {t('exactCash')}
                </Button>
              </div>

              <Button
                type="button"
                className="h-10 w-full !text-lg font-semibold md:h-11 md:!text-xl"
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
              <Button
                type="button"
                className="h-10 w-full !text-lg font-semibold md:h-11 md:!text-xl"
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
    </div>
  );
}
