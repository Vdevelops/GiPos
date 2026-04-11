'use client';

import { Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useProduct } from '../hooks/use-products';
import { formatCurrency } from '@/lib/currency';
import { resolveAssetUrl } from '@/lib/asset-url';
import type { Product } from '../types';

interface ProductDetailProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly productId: string | null;
}

export function ProductDetail({
  open,
  onOpenChange,
  productId,
}: ProductDetailProps) {
  const { data: productData, isLoading } = useProduct(productId);

  const product = productData?.data;
  const imageUrl = resolveAssetUrl(product?.images?.[0]?.url);

  if (!open || !productId) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription>
            View detailed information about the product
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : !product ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Product not found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Product Image */}
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product?.images?.[0]?.alt ?? product?.name ?? 'Product'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="h-24 w-24 text-muted-foreground" />
              )}
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold">{product?.name ?? 'Unknown Product'}</h3>
                <p className="text-muted-foreground mt-1">
                  SKU: <span className="font-mono">{product?.sku ?? '-'}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-xl font-bold">{formatCurrency(product?.price ?? 0)}</p>
                </div>
                {product?.cost && (
                  <div>
                    <p className="text-sm text-muted-foreground">Cost</p>
                    <p className="text-xl font-bold">{formatCurrency(product.cost)}</p>
                  </div>
                )}
              </div>

              {product?.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-sm">{product.description}</p>
                </div>
              )}

              <Separator />

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">
                    {product?.category?.name ?? '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      product?.status === 'active'
                        ? 'default'
                        : product?.status === 'archived'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {product?.status ?? 'inactive'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taxable</p>
                  <Badge variant={product?.taxable ? 'default' : 'outline'}>
                    {product?.taxable ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Track Stock</p>
                  <Badge variant={product?.track_stock ? 'default' : 'outline'}>
                    {product?.track_stock ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              {/* Stock Information */}
              {product?.stocks && product.stocks.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Stock Information</p>
                    <div className="space-y-2">
                      {product.stocks.map((stock, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              {stock?.warehouse?.name ?? 'Unknown Warehouse'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Available: {stock?.quantity ?? 0} | Reserved: {stock?.reserved ?? 0}
                            </p>
                          </div>
                          <Badge variant={stock?.quantity === 0 ? 'destructive' : 'secondary'}>
                            {stock?.quantity ?? 0}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Timestamps */}
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Created At</p>
                  <p>{product?.created_at ? new Date(product.created_at).toLocaleString() : '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Updated At</p>
                  <p>{product?.updated_at ? new Date(product.updated_at).toLocaleString() : '-'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
