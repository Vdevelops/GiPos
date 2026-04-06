'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePOS } from '../hooks/use-pos';
import { POSProductGrid } from './pos-product-grid';
import { POSCart } from './pos-cart';
import { POSCartSummary } from './pos-cart-summary';
import { PaymentModal } from './payment-modal';
import { useDebounce } from '@/hooks/use-debounce';

export function POSInterface() {
  const t = useTranslations('pos');
  const {
    searchQuery,
    setSearchQuery,
    cart,
    products,
    isLoadingProducts,
    totals,
    addToCart,
    updateQuantity,
    removeFromCart,
    processCheckout,
    isProcessing,
  } = usePOS();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter products based on search (client-side filtering for better UX)
  const filteredProducts = products.filter((product) => {
    if (!debouncedSearch) return true;
    const query = debouncedSearch.toLowerCase();
    return (
      product?.name?.toLowerCase().includes(query) ||
      product?.sku?.toLowerCase().includes(query) ||
      product?.barcode?.toLowerCase().includes(query)
    );
  });

  const handlePayment = async (
    method: string,
    data: Record<string, unknown>
  ) => {
    try {
      // TODO: Get outlet_id and shift_id from context/store
      const outletId = 'default-outlet-id'; // This should come from user context
      const shiftId = null; // This should come from active shift

      await processCheckout(outletId, shiftId, method, data);
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Payment error:', error);
      // Error is handled by mutation hooks (toast)
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Main Content - Product Grid */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto">
          <POSProductGrid
            products={filteredProducts}
            isLoading={isLoadingProducts}
            onProductClick={addToCart}
          />
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 border-l bg-background flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="text-lg font-semibold">{t('cart')}</h2>
            <Badge variant="secondary">
              {cart.length} {t('item')}
            </Badge>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <POSCart
            items={cart}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
          />
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <POSCartSummary
            items={cart}
            taxable={true}
            onCheckout={() => setShowPaymentModal(true)}
          />
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        items={cart}
        total={totals.total}
        taxable={true}
        onPayment={handlePayment}
        isLoading={isProcessing}
      />
    </div>
  );
}
