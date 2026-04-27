'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Search, ShoppingCart, Trash2, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { usePOS } from '../hooks/use-pos';
import { POSProductGrid } from './pos-product-grid';
import { POSCart } from './pos-cart';
import { PaymentSection } from './payment-section';
import { useDebounce } from '@/hooks/use-debounce';
import { formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

const POS_PRODUCT_ORDER_STORAGE_KEY = 'gipos-pos-product-order';

export function POSInterface() {
  const t = useTranslations('pos');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<'all' | string>('all');
  const [productOrder, setProductOrder] = useState<string[]>([]);
  const { setOpen } = useSidebar();
  const {
    searchQuery,
    setSearchQuery,
    cart,
    products,
    isLoadingProducts,
    totals,
    isWednesdayDiscountAvailable,
    isWednesdayDiscountEnabled,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    updateWednesdayDiscountEnabled,
    processCheckout,
    isProcessing,
    hasPendingSale,
    pendingSale,
  } = usePOS();

  const debouncedSearch = useDebounce(searchQuery, 300);

  const productIds = useMemo(
    () => products.map((product) => product?.id).filter((id): id is string => Boolean(id)),
    [products]
  );

  useEffect(() => {
    setOpen(false);
  }, [setOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const savedOrder = window.localStorage.getItem(POS_PRODUCT_ORDER_STORAGE_KEY);
      if (!savedOrder) {
        return;
      }

      const parsed = JSON.parse(savedOrder);
      if (!Array.isArray(parsed)) {
        return;
      }

      setProductOrder(parsed.filter((id): id is string => typeof id === 'string' && id.length > 0));
    } catch {
      // Ignore hydration error, ordering still works in-memory.
    }
  }, []);

  useEffect(() => {
    if (productIds.length === 0) {
      return;
    }

    setProductOrder((prev) => {
      const availableIds = new Set(productIds);
      const normalized = prev.filter((id) => availableIds.has(id));
      const normalizedSet = new Set(normalized);
      const missingIds = productIds.filter((id) => !normalizedSet.has(id));
      const nextOrder = [...normalized, ...missingIds];

      if (nextOrder.length === prev.length && nextOrder.every((id, index) => id === prev[index])) {
        return prev;
      }

      return nextOrder;
    });
  }, [productIds]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(POS_PRODUCT_ORDER_STORAGE_KEY, JSON.stringify(productOrder));
    } catch {
      // Ignore storage write error, ordering still works in-memory.
    }
  }, [productOrder]);

  const categoryOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: Array<{ id: string; label: string }> = [];

    for (const product of products) {
      const categoryId = product?.category_id;
      const categoryName = product?.category?.name;
      if (!categoryId || !categoryName || seen.has(categoryId)) {
        continue;
      }

      seen.add(categoryId);
      options.push({ id: categoryId, label: categoryName });
    }

    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [products]);

  // Filter products based on search (client-side filtering for better UX)
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory =
        selectedCategoryId === 'all' || product?.category_id === selectedCategoryId;

      if (!matchesCategory) return false;
      if (!debouncedSearch) return true;

      const query = debouncedSearch.toLowerCase();
      return (
        product?.name?.toLowerCase().includes(query) ||
        product?.sku?.toLowerCase().includes(query) ||
        product?.barcode?.toLowerCase().includes(query)
      );
    });

    if (filtered.length <= 1 || productOrder.length === 0) {
      return filtered;
    }

    const indexMap = new Map(productOrder.map((id, index) => [id, index]));
    return [...filtered].sort((a, b) => {
      const aIndex = indexMap.get(a?.id ?? '') ?? Number.MAX_SAFE_INTEGER;
      const bIndex = indexMap.get(b?.id ?? '') ?? Number.MAX_SAFE_INTEGER;
      return aIndex - bIndex;
    });
  }, [products, selectedCategoryId, debouncedSearch, productOrder]);

  const handleReorderProducts = (sourceProductId: string, targetProductId: string) => {
    setProductOrder((prev) => {
      const baseOrder = prev.length > 0 ? [...prev] : [...productIds];
      const sourceIndex = baseOrder.indexOf(sourceProductId);
      const targetIndex = baseOrder.indexOf(targetProductId);

      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
        return prev;
      }

      const [moved] = baseOrder.splice(sourceIndex, 1);
      baseOrder.splice(targetIndex, 0, moved);
      return baseOrder;
    });
  };

  const outletId = useMemo(
    () =>
      cart.find((item) => item.product?.outlet?.id || item.product?.outlet_id)?.product?.outlet?.id ??
      cart.find((item) => item.product?.outlet_id)?.product?.outlet_id ??
      products.find((product) => product?.outlet?.id || product?.outlet_id)?.outlet?.id ??
      products.find((product) => product?.outlet_id)?.outlet_id ??
      '',
    [cart, products]
  );

  const handlePayment = async (method: 'cash' | 'qris', data: Record<string, unknown>) => {
    try {
      const shiftId = null; // This should come from active shift

      await processCheckout(outletId, shiftId, method, data);
      setIsMobileCartOpen(false);
      setIsPaymentModalOpen(false);
    } catch (error) {
      console.error('Payment error:', error);
      // Error is handled by mutation hooks (toast)
    }
  };

  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const renderCartPanel = (options?: {
    className?: string;
    withCheckoutInset?: boolean;
  }) => (
    <div className={cn('flex h-full min-h-0 flex-col bg-background', options?.className)}>
      <div className="border-b p-4">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('total')}
            </p>
            <h2 className="text-2xl font-bold leading-tight md:text-3xl">
              {formatCurrency(totals.total)}
            </h2>
            {totals.discountAmount > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                {t('priceBeforeDiscount')}{' '}
                <span className="font-medium text-foreground">
                  {formatCurrency(totals.subtotal)}
                </span>
              </p>
            )}
            <div className="mt-1 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary">
                {itemCount} {t('item')}
              </Badge>
            </div>
          </div>

          <div className="flex w-full items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2 sm:w-auto sm:shrink-0 sm:justify-start">
            <p className="text-xs font-semibold text-muted-foreground md:text-sm whitespace-nowrap">
              {t('discountToggle')}
            </p>
            <Switch
              checked={isWednesdayDiscountEnabled}
              onCheckedChange={updateWednesdayDiscountEnabled}
              disabled={isProcessing || hasPendingSale}
              aria-label={t('discountToggle')}
              className="h-6 w-12 md:h-7 md:w-14"
            />
          </div>
        </div>

        {isWednesdayDiscountAvailable && (
          <p className="mb-1 text-xs text-muted-foreground">
            {t('wednesdayDiscountAutoOn')}
          </p>
        )}

        {totals.hasDiscountEligibleItems && (
          <p className="text-xs text-muted-foreground">{t('discountPackageExcluded')}</p>
        )}

        {hasPendingSale && (
          <p className="mt-1 text-xs text-muted-foreground">
            {t('pendingSaleCartNotice', {
              reference: pendingSale?.invoiceNumber ?? pendingSale?.id ?? '-',
            })}
          </p>
        )}
      </div>

      <div
        className={cn(
          'min-h-[12rem] flex-1 overflow-y-auto p-4',
          options?.withCheckoutInset ? 'pb-28 lg:pb-24' : undefined
        )}
      >
        <POSCart
          items={cart}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          isLocked={hasPendingSale}
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="grid h-[calc(100dvh-4rem)] min-h-0 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(16rem,32%)_minmax(0,1fr)] xl:grid-cols-[minmax(18rem,30%)_minmax(0,1fr)] 2xl:grid-cols-[minmax(20rem,28%)_minmax(0,1fr)]">
        <aside className="hidden min-h-0 border-r bg-background lg:sticky lg:top-0 lg:h-[calc(100dvh-4rem)] lg:flex-col lg:flex">
          {renderCartPanel({ withCheckoutInset: true })}
        </aside>

        <div className="flex min-w-0 min-h-0 flex-col overflow-hidden p-3 sm:p-4 lg:p-5">
          <div className="mb-3 shrink-0 sm:mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-10 text-base sm:h-12 sm:text-lg"
              />
            </div>

            <div className="mt-3 overflow-x-auto pb-1">
              <div className="flex w-max items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={selectedCategoryId === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategoryId('all')}
                  className="h-8 rounded-full px-4"
                >
                  {t('allCategories')}
                </Button>

                {categoryOptions.map((category) => (
                  <Button
                    key={category.id}
                    type="button"
                    size="sm"
                    variant={selectedCategoryId === category.id ? 'default' : 'outline'}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className="h-8 rounded-full px-4"
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pb-20 pr-1 lg:pb-0">
            <POSProductGrid
              products={filteredProducts}
              isLoading={isLoadingProducts}
              onProductClick={addToCart}
              onReorderProducts={handleReorderProducts}
              isCheckoutLocked={hasPendingSale}
            />
          </div>
        </div>
      </div>

      {itemCount > 0 && !isMobileCartOpen && (
        <div className="fixed right-4 bottom-20 z-40 flex items-center gap-2 sm:bottom-24 lg:bottom-4">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-full border-destructive/40 px-4 text-sm font-semibold text-destructive shadow-lg hover:border-destructive hover:bg-destructive/10 hover:text-destructive lg:h-12 lg:px-5 lg:text-base"
            onClick={clearCart}
            disabled={isProcessing || hasPendingSale}
          >
            <Trash2 className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
            {t('clearAll')}
          </Button>

          <Button
            type="button"
            className="h-11 rounded-full px-4 text-sm font-semibold shadow-lg lg:h-12 lg:px-5 lg:text-base"
            onClick={() => setIsPaymentModalOpen(true)}
            disabled={isProcessing}
          >
            <Wallet className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
            Lanjutkan Pembayaran
          </Button>
        </div>
      )}

      <Button
        type="button"
        size="lg"
        className="fixed right-4 bottom-4 z-40 h-14 rounded-full px-5 shadow-lg lg:hidden"
        onClick={() => setIsMobileCartOpen(true)}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        <span className="mr-2">{itemCount}</span>
        <span className="text-xs font-medium opacity-90">{formatCurrency(totals.total)}</span>
      </Button>

      <Sheet open={isMobileCartOpen} onOpenChange={setIsMobileCartOpen}>
        <SheetContent side="bottom" className="h-[88dvh] rounded-t-2xl p-0 lg:hidden">
          {renderCartPanel({ className: 'border-0', withCheckoutInset: true })}
        </SheetContent>
      </Sheet>

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent showCloseButton={false} className="max-h-[90dvh] overflow-y-auto p-0 sm:max-w-xl">
          <DialogTitle className="sr-only">{t('payment')}</DialogTitle>
          <div className="flex items-center justify-between border-b px-3 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-sm"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Kembali Tambah Produk
            </Button>
          </div>

          <PaymentSection
            subtotal={totals.subtotal}
            discountAmount={totals.discountAmount}
            discountPercent={totals.discountPercent}
            isDiscountAvailable={isWednesdayDiscountAvailable}
            isDiscountEnabled={isWednesdayDiscountEnabled}
            onDiscountEnabledChange={updateWednesdayDiscountEnabled}
            isDiscountToggleDisabled={isProcessing || hasPendingSale}
            hasDiscountEligibleItems={totals.hasDiscountEligibleItems}
            total={totals.total}
            itemCount={itemCount}
            isLoading={isProcessing}
            hasPendingSale={hasPendingSale}
            pendingReference={pendingSale?.invoiceNumber ?? pendingSale?.id}
            onPayCash={(amountPaid) => handlePayment('cash', { amount_paid: amountPaid })}
            onPayQris={() => handlePayment('qris', {})}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
