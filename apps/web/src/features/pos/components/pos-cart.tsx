'use client';

import { Minus } from 'lucide-react';
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
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <p className="text-base text-muted-foreground md:text-lg">Cart is empty</p>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Add products to get started
        </p>
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
          <div key={product?.id ?? 'unknown'} className="py-3 first:pt-0">
            <div className="mb-1 flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-base font-medium md:text-lg">
                  {product?.name ?? 'Unknown Product'}
                </h4>
                <p className="text-sm text-muted-foreground md:text-base">
                  {formatCurrency(unitPrice)} x {item.quantity}
                </p>
              </div>

              <p className="text-base font-semibold md:text-lg">{formatCurrency(itemTotal)}</p>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-sm md:h-9 md:text-base"
                onClick={() => onUpdateQuantity(product?.id ?? '', -1)}
                disabled={isLocked || item.quantity <= 1}
              >
                <Minus className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                Kurangi
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-sm text-destructive hover:text-destructive md:h-9 md:text-base"
                onClick={() => onRemove(product?.id ?? '')}
                disabled={isLocked}
              >
                Hapus
              </Button>

              <span className="ml-auto text-sm text-muted-foreground md:text-base">
                Qty: {item.quantity}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
