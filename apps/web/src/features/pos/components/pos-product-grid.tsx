'use client';

import { Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/currency';
import type { Product } from '@/features/products/types';

interface POSProductGridProps {
  readonly products: Product[] | undefined;
  readonly isLoading?: boolean;
  readonly onProductClick: (product: Product) => void;
  readonly isCheckoutLocked?: boolean;
}

export function POSProductGrid({
  products,
  isLoading = false,
  onProductClick,
  isCheckoutLocked = false,
}: POSProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i} className="gap-0 overflow-hidden py-0">
            <CardContent className="p-0">
              <Skeleton className="aspect-square w-full rounded-t-xl rounded-b-none" />
              <div className="space-y-1 px-1.5 py-1.5 sm:px-2 sm:py-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-5 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const productList = products ?? [];

  if (productList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No products found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
      {productList.map((product) => {
        const price = product?.price ?? 0;
        const quantity = product?.stocks?.[0]?.quantity ?? 0;
        const reserved = product?.stocks?.[0]?.reserved ?? 0;
        const available = Math.max(0, quantity - reserved);
        const isOutOfStock = available <= 0;
        const isDisabled = isOutOfStock || isCheckoutLocked;

        return (
          <Card
            key={product?.id ?? 'unknown'}
            className={`min-w-0 cursor-pointer gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md ${
              isDisabled ? 'opacity-50' : ''
            }`}
            onClick={() => {
              if (!isDisabled) {
                onProductClick(product);
              }
            }}
          >
            <CardContent className="p-0">
              <div className="flex aspect-square w-full items-center justify-center rounded-t-xl rounded-b-none bg-muted overflow-hidden">
                {product?.images?.[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.images[0]?.alt ?? product?.name ?? 'Product'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <div className="px-1.5 py-1.5 sm:px-2 sm:py-2">
                <h3 className="mb-0.5 line-clamp-2 text-xs font-semibold sm:text-sm">
                  {product?.name ?? 'Unknown Product'}
                </h3>
                <p className="text-sm font-bold text-primary sm:text-base">
                  {formatCurrency(price)}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
