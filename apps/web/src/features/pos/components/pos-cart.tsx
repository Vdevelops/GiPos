'use client';

import { Plus, Minus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
}

export function POSCart({ items, onUpdateQuantity, onRemove }: POSCartProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <p className="text-muted-foreground">Cart is empty</p>
        <p className="text-sm text-muted-foreground mt-2">
          Add products to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const product = item.product;
        const unitPrice = product?.price ?? 0;
        const itemTotal = unitPrice * item.quantity;

        return (
          <Card key={product?.id ?? 'unknown'}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">
                    {product?.name ?? 'Unknown Product'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(unitPrice)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => onRemove(product?.id ?? '')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(product?.id ?? '', -1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(product?.id ?? '', 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="font-semibold">{formatCurrency(itemTotal)}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
