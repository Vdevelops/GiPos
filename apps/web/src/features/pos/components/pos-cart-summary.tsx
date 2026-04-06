'use client';

import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/currency';
import type { CartItem } from './pos-cart';

interface POSCartSummaryProps {
  readonly items: CartItem[];
  readonly taxable?: boolean;
  readonly onCheckout: () => void;
}

export function POSCartSummary({
  items,
  taxable = true,
  onCheckout,
}: POSCartSummaryProps) {
  // Calculate totals with defensive programming
  const subtotal =
    items.reduce((sum, item) => {
      const product = item.product;
      const price = product?.price ?? 0;
      const quantity = item.quantity ?? 0;
      return sum + price * quantity;
    }, 0) ?? 0;

  const taxRate = taxable ? 0.1 : 0;
  const taxAmount = Math.round(subtotal * taxRate);
  const total = subtotal + taxAmount;

  return (
    <div className="border-t p-4 space-y-4 bg-muted/50">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {taxable && taxAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (10%)</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <Button
        className="w-full h-12 text-lg"
        size="lg"
        onClick={onCheckout}
        disabled={items.length === 0}
      >
        <CreditCard className="mr-2 h-5 w-5" />
        Pay Now
      </Button>
    </div>
  );
}
