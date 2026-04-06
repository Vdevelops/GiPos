'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { usePOS } from '../hooks/use-pos';
import { POSProductGrid } from './pos-product-grid';
import { POSCart } from './pos-cart';
import { PaymentSection } from './payment-section';
import { useDebounce } from '@/hooks/use-debounce';
import { formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';

export function POSInterface() {
  const t = useTranslations('pos');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<'all' | string>('all');
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
    updateWednesdayDiscountEnabled,
    processCheckout,
    isProcessing,
    hasPendingSale,
    pendingSale,
  } = usePOS();

  const debouncedSearch = useDebounce(searchQuery, 300);

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
  const filteredProducts = products.filter((product) => {
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
    includePayment?: boolean;
  }) => (
    <div className={cn('flex h-full min-h-0 flex-col bg-background', options?.className)}>
      <div className="border-b p-4">
        <div className="mb-3 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <h2 className="text-lg font-semibold">{t('cart')}</h2>
          <Badge variant="secondary">
            {itemCount} {t('item')}
          </Badge>
        </div>
        {hasPendingSale && (
          <p className="text-xs text-muted-foreground">
            Payment retry mode for invoice {pendingSale?.invoiceNumber ?? pendingSale?.id}
          </p>
        )}
      </div>

      <div className="min-h-[12rem] flex-1 overflow-y-auto p-4">
        <POSCart
          items={cart}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          isLocked={hasPendingSale}
        />
      </div>

      {options?.includePayment && (
        <PaymentSection
          subtotal={totals.subtotal}
          discountAmount={totals.discountAmount}
          discountPercent={totals.discountPercent}
          isDiscountAvailable={isWednesdayDiscountAvailable}
          isDiscountEnabled={isWednesdayDiscountEnabled}
          onDiscountEnabledChange={updateWednesdayDiscountEnabled}
          isDiscountToggleDisabled={isProcessing || hasPendingSale}
          total={totals.total}
          itemCount={itemCount}
          isLoading={isProcessing}
          hasPendingSale={hasPendingSale}
          pendingReference={pendingSale?.invoiceNumber ?? pendingSale?.id}
          onPayCash={(amountPaid) => handlePayment('cash', { amount_paid: amountPaid })}
          onPayQris={() => handlePayment('qris', {})}
        />
      )}
    </div>
  );

  return (
    <>
      <div className="grid h-[calc(100dvh-4rem)] min-h-0 grid-cols-1 overflow-hidden md:grid-cols-[minmax(0,1fr)_minmax(14rem,32%)_minmax(14rem,32%)] lg:grid-cols-[minmax(0,1fr)_minmax(16rem,30%)_minmax(16rem,30%)] xl:grid-cols-[minmax(0,1fr)_minmax(18rem,28%)_minmax(18rem,28%)] 2xl:grid-cols-[minmax(0,1fr)_minmax(20rem,26%)_minmax(20rem,26%)]">
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

          <div className="min-h-0 flex-1 overflow-y-auto pr-1 pb-20 md:pb-0">
            <POSProductGrid
              products={filteredProducts}
              isLoading={isLoadingProducts}
              onProductClick={addToCart}
              isCheckoutLocked={hasPendingSale}
            />
          </div>
        </div>

        <aside className="hidden min-h-0 border-l bg-background md:sticky md:top-0 md:h-[calc(100dvh-4rem)] md:flex-col md:flex">
          {renderCartPanel({ includePayment: false })}
        </aside>

        <aside className="hidden min-h-0 border-l bg-muted/20 md:sticky md:top-0 md:h-[calc(100dvh-4rem)] md:flex md:flex-col">
          <div className="min-h-0 flex-1 overflow-hidden p-4">
            <PaymentSection
              subtotal={totals.subtotal}
              discountAmount={totals.discountAmount}
              discountPercent={totals.discountPercent}
              isDiscountAvailable={isWednesdayDiscountAvailable}
              isDiscountEnabled={isWednesdayDiscountEnabled}
              onDiscountEnabledChange={updateWednesdayDiscountEnabled}
              isDiscountToggleDisabled={isProcessing || hasPendingSale}
              total={totals.total}
              itemCount={itemCount}
              isLoading={isProcessing}
              hasPendingSale={hasPendingSale}
              pendingReference={pendingSale?.invoiceNumber ?? pendingSale?.id}
              onPayCash={(amountPaid) => handlePayment('cash', { amount_paid: amountPaid })}
              onPayQris={() => handlePayment('qris', {})}
              className="h-full"
            />
          </div>
        </aside>
      </div>

      <Button
        type="button"
        size="lg"
        className="fixed right-4 bottom-4 z-40 h-14 rounded-full px-5 shadow-lg md:hidden"
        onClick={() => setIsMobileCartOpen(true)}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        <span className="mr-2">{itemCount}</span>
        <span className="text-xs font-medium opacity-90">{formatCurrency(totals.total)}</span>
      </Button>

      <Sheet open={isMobileCartOpen} onOpenChange={setIsMobileCartOpen}>
        <SheetContent side="bottom" className="h-[88dvh] rounded-t-2xl p-0 md:hidden">
          {renderCartPanel({ className: 'border-0', includePayment: true })}
        </SheetContent>
      </Sheet>
    </>
  );
}
