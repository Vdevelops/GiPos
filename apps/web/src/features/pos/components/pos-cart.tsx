'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';
import type { Product } from '@/features/products/types';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface POSCartProps {
  readonly items: CartItem[];
  readonly onUpdateQuantity: (productId: string, delta: number) => void;
  readonly onRemove: (productId: string) => void;
  readonly isLocked?: boolean;
}

export function POSCart({ items, onUpdateQuantity, onRemove, isLocked = false }: POSCartProps) {
  const t = useTranslations('pos');

  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-muted-foreground md:text-base">{t('cartEmpty')}</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {items.map((item) => {
        const product = item.product;
        const unitPrice = product?.price ?? 0;
        const itemTotal = unitPrice * item.quantity;

        return (
          <div key={product?.id ?? 'unknown'} className="py-2.5 first:pt-0">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1 space-y-0.5">
                <h4 className="truncate text-sm font-medium md:text-base">
                  {product?.name ?? 'Unknown Product'}
                </h4>
                <p className="text-xs text-muted-foreground md:text-sm">
                  {formatCurrency(unitPrice)} / item
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7"
                onClick={() => onUpdateQuantity(product?.id ?? '', -1)}
                disabled={isLocked || item.quantity <= 1}
                aria-label={`Kurangi qty ${product?.name ?? 'product'}`}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>

              <span className="min-w-8 text-center text-sm font-medium md:text-base">{item.quantity}</span>

              <Button
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7"
                onClick={() => onUpdateQuantity(product?.id ?? '', 1)}
                disabled={isLocked}
                aria-label={`Tambah qty ${product?.name ?? 'product'}`}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>

              <p className="ml-auto text-sm font-semibold md:text-base">{formatCurrency(itemTotal)}</p>

              <Button
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onRemove(product?.id ?? '')}
                disabled={isLocked}
                aria-label={`Hapus ${product?.name ?? 'product'} dari cart`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
