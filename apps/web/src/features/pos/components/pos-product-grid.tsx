'use client';

import { useState } from 'react';
import { Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/currency';
import { resolveAssetUrl } from '@/lib/asset-url';
import type { Product } from '@/features/products/types';

interface POSProductGridProps {
  readonly products: Product[] | undefined;
  readonly isLoading?: boolean;
  readonly onProductClick: (product: Product) => void;
  readonly onReorderProducts?: (sourceProductId: string, targetProductId: string) => void;
  readonly isReorderMode?: boolean;
  readonly isCheckoutLocked?: boolean;
}

export function POSProductGrid({
  products,
  isLoading = false,
  onProductClick,
  onReorderProducts,
  isReorderMode = false,
  isCheckoutLocked = false,
}: POSProductGridProps) {
  const [draggingProductId, setDraggingProductId] = useState<string | null>(null);
  const [dragOverProductId, setDragOverProductId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border bg-card text-card-foreground">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="space-y-1 px-1.5 py-1.5 sm:px-2 sm:py-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          </div>
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
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 2xl:grid-cols-5">
      {productList.map((product) => {
        const productId = product?.id ?? '';
        const price = product?.price ?? 0;
        const isDisabled = isCheckoutLocked;
        const imageUrl = resolveAssetUrl(product?.images?.[0]?.url);
        const isDragging = draggingProductId === productId;
        const isDragOver = dragOverProductId === productId;

        return (
          <div
            key={productId || 'unknown'}
            data-pos-product-id={productId}
            draggable={isReorderMode && Boolean(productId)}
            className={`min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground transition-all hover:shadow-md ${
              isReorderMode ? 'cursor-move touch-none' : 'cursor-pointer'
            } ${
              isDisabled ? 'opacity-50' : ''
            } ${
              isDragging ? 'scale-[0.98] opacity-60' : ''
            } ${
              isDragOver ? 'ring-2 ring-primary ring-offset-2' : ''
            }`}
            onDragStart={(event) => {
              if (!isReorderMode || !productId) {
                return;
              }
              event.dataTransfer.setData('text/plain', productId);
              event.dataTransfer.effectAllowed = 'move';
              setDraggingProductId(productId);
            }}
            onDragOver={(event) => {
              if (!isReorderMode || !productId || !draggingProductId || draggingProductId === productId) {
                return;
              }
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              setDragOverProductId(productId);
            }}
            onDragLeave={() => {
              setDragOverProductId((prev) => (prev === productId ? null : prev));
            }}
            onDrop={(event) => {
              if (!isReorderMode) {
                return;
              }

              event.preventDefault();
              if (!productId) {
                return;
              }

              const sourceProductId = event.dataTransfer.getData('text/plain') || draggingProductId;
              if (!sourceProductId || sourceProductId === productId) {
                return;
              }

              onReorderProducts?.(sourceProductId, productId);
              setDragOverProductId(null);
            }}
            onDragEnd={() => {
              setDraggingProductId(null);
              setDragOverProductId(null);
            }}
            onTouchStart={(event) => {
              if (!isReorderMode || !productId) {
                return;
              }

              setDraggingProductId(productId);
              setDragOverProductId(productId);
              event.preventDefault();
            }}
            onTouchMove={(event) => {
              if (!isReorderMode || !draggingProductId) {
                return;
              }

              const touch = event.touches[0];
              if (!touch) {
                return;
              }

              const hoveredElement = document.elementFromPoint(touch.clientX, touch.clientY);
              const hoveredCard = hoveredElement?.closest('[data-pos-product-id]') as HTMLElement | null;
              const hoveredProductId = hoveredCard?.dataset.posProductId;

              if (hoveredProductId && hoveredProductId !== draggingProductId) {
                setDragOverProductId(hoveredProductId);
              }

              event.preventDefault();
            }}
            onTouchEnd={() => {
              if (
                isReorderMode &&
                draggingProductId &&
                dragOverProductId &&
                draggingProductId !== dragOverProductId
              ) {
                onReorderProducts?.(draggingProductId, dragOverProductId);
              }

              setDraggingProductId(null);
              setDragOverProductId(null);
            }}
            onTouchCancel={() => {
              setDraggingProductId(null);
              setDragOverProductId(null);
            }}
            onClick={() => {
              if (!isDisabled && !isReorderMode) {
                onProductClick(product);
              }
            }}
          >
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-muted">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product?.images?.[0]?.alt ?? product?.name ?? 'Product'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <div className="px-1 py-1.5 sm:px-1.5 sm:py-2">
              <h3 className="mb-0.5 line-clamp-2 text-base font-semibold sm:text-lg">
                {product?.name ?? 'Unknown Product'}
              </h3>
              <p className="text-sm font-semibold text-primary sm:text-base">
                {formatCurrency(price)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
