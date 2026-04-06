'use client';

import { Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/currency';
import type { Product } from '@/features/products/types';

interface POSProductGridProps {
  readonly products: Product[] | undefined;
  readonly isLoading?: boolean;
  readonly onProductClick: (product: Product) => void;
}

export function POSProductGrid({
  products,
  isLoading = false,
  onProductClick,
}: POSProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="aspect-square w-full mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-6 w-2/3 mb-2" />
              <Skeleton className="h-5 w-1/2" />
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {productList.map((product) => {
        const price = product?.price ?? 0;
        const stock = product?.stocks?.[0]?.quantity ?? 0;
        const isOutOfStock = stock <= 0;

        return (
          <Card
            key={product?.id ?? 'unknown'}
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              isOutOfStock ? 'opacity-50' : ''
            }`}
            onClick={() => {
              if (!isOutOfStock) {
                onProductClick(product);
              }
            }}
          >
            <CardContent className="p-4">
              <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                {product?.images?.[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.images[0]?.alt ?? product?.name ?? 'Product'}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Package className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                {product?.name ?? 'Unknown Product'}
              </h3>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(price)}
              </p>
              <Badge
                variant={isOutOfStock ? 'destructive' : 'outline'}
                className="mt-2"
              >
                Stock: {stock}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
