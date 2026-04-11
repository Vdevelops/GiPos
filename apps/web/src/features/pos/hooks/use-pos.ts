'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useProducts } from '@/features/products/hooks/use-products';
import { useCreateSale } from './use-sales';
import { useProcessPayment } from './use-payments';
import type { Product } from '@/features/products/types';
import type { CartItem } from '../components/pos-cart';

type PaymentMethod = 'cash' | 'qris';

interface PendingSale {
  id: string;
  total: number;
  invoiceNumber?: string;
}

const WEDNESDAY_DISCOUNT_PERCENT = 20;

function isPackageProduct(product: Product | undefined | null): boolean {
  const categoryName = product?.category?.name?.trim().toLowerCase();
  if (!categoryName) {
    return false;
  }

  return categoryName.includes('paket');
}

function getItemSubtotal(item: CartItem): number {
  const price = item.product?.price ?? 0;
  const quantity = item.quantity ?? 0;
  return price * quantity;
}

function getItemDiscountAmount(item: CartItem, discountPercent: number): number {
  if (discountPercent <= 0 || isPackageProduct(item.product)) {
    return 0;
  }

  return Math.floor(getItemSubtotal(item) * (discountPercent / 100));
}

/**
 * Hook for POS interface
 * Manages cart state and business logic
 */
export function usePOS() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pendingSale, setPendingSale] = useState<PendingSale | null>(null);
  const [isWednesdayDiscountEnabled, setIsWednesdayDiscountEnabled] = useState(false);

  const isWednesdayDiscountAvailable = useMemo(
    () => new Date().getDay() === 3,
    []
  );

  useEffect(() => {
    if (isWednesdayDiscountAvailable) {
      setIsWednesdayDiscountEnabled(true);
    }
  }, [isWednesdayDiscountAvailable]);

  // Fetch products with search
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    search: searchQuery || undefined,
    per_page: 100,
    status: 'active',
  });

  const products = productsData?.data ?? [];

  // Create sale mutation
  const createSaleMutation = useCreateSale();
  const processPaymentMutation = useProcessPayment();

  // Add product to cart
  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      if (pendingSale) {
        return prev;
      }

      const existingItem = prev.find(
        (item) => item.product?.id === product?.id
      );

      if (existingItem) {
        return prev.map((item) =>
          item.product?.id === product?.id
            ? { ...item, quantity: (item.quantity ?? 0) + 1 }
            : item
        );
      }

      return [...prev, { product, quantity: 1 }];
    });
  }, [pendingSale]);

  // Update quantity
  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      {
        if (pendingSale) {
          return prev;
        }

        return prev
          .map((item) => {
            if (item.product?.id !== productId) {
              return item;
            }

            const currentQty = item.quantity ?? 0;
            const nextQty = currentQty + delta;

            return {
              ...item,
              quantity: Math.max(0, nextQty),
            };
          })
          .filter((item) => (item.quantity ?? 0) > 0);
      }
    );
  }, [pendingSale]);

  // Remove from cart
  const removeFromCart = useCallback((productId: string) => {
    if (pendingSale) {
      return;
    }
    setCart((prev) => prev.filter((item) => item.product?.id !== productId));
  }, [pendingSale]);

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([]);
    setPendingSale(null);
  }, []);

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + getItemSubtotal(item), 0);
    const discountPercent = isWednesdayDiscountEnabled ? WEDNESDAY_DISCOUNT_PERCENT : 0;
    const discountEligibleSubtotal = cart.reduce((sum, item) => {
      if (isPackageProduct(item.product)) {
        return sum;
      }

      return sum + getItemSubtotal(item);
    }, 0);
    const discountAmount = cart.reduce(
      (sum, item) => sum + getItemDiscountAmount(item, discountPercent),
      0
    );
    const total = Math.max(0, subtotal - discountAmount);

    return {
      subtotal,
      discountPercent,
      discountEligibleSubtotal,
      hasDiscountEligibleItems: discountEligibleSubtotal > 0,
      discountAmount,
      total,
    };
  }, [cart, isWednesdayDiscountEnabled]);

  const updateWednesdayDiscountEnabled = useCallback((enabled: boolean) => {
    if (pendingSale) {
      return;
    }

    setIsWednesdayDiscountEnabled(enabled);
  }, [pendingSale]);

  // Process checkout
  const processCheckout = useCallback(
    async (
      outletId: string,
      shiftId: string | null,
      paymentMethod: PaymentMethod,
      paymentData: Record<string, unknown>
    ) => {
      try {
        if (!pendingSale && cart.length === 0) {
          throw new Error('Cart is empty');
        }

        const normalizedOutletId = outletId.trim();
        if (!normalizedOutletId) {
          throw new Error('Outlet is required to process checkout');
        }

        if (!/^\d+$/.test(normalizedOutletId)) {
          throw new Error('Invalid outlet selected for checkout');
        }

        let saleId = pendingSale?.id;
        let saleTotal = pendingSale?.total ?? totals.total;
        let saleData = null;

        // Create sale once. If payment fails, keep pendingSale and retry payment using same sale_id.
        if (!saleId) {
          const itemDiscountPercent = isWednesdayDiscountEnabled
            ? WEDNESDAY_DISCOUNT_PERCENT
            : 0;

          const saleItems = cart.map((item) => ({
            product_id: item.product?.id ?? '',
            quantity: item.quantity ?? 0,
            unit_price: item.product?.price ?? null,
            discount_percent:
              itemDiscountPercent > 0 && !isPackageProduct(item.product)
                ? itemDiscountPercent
                : undefined,
          }));

          const saleResponse = await createSaleMutation.mutateAsync({
            outlet_id: normalizedOutletId,
            shift_id: shiftId,
            items: saleItems,
            payment_method: paymentMethod,
          });

          if (!saleResponse.success || !saleResponse.data) {
            throw new Error(saleResponse.error?.message ?? 'Failed to create sale');
          }

          saleId = saleResponse.data.id;
          saleTotal = saleResponse.data.total;
          saleData = saleResponse.data;

          setPendingSale({
            id: saleResponse.data.id,
            total: saleResponse.data.total,
            invoiceNumber: saleResponse.data.invoice_number,
          });
        }

        if (!saleId) {
          throw new Error('Failed to initialize sale');
        }

        // Process payment
        const paymentResponse = await processPaymentMutation.mutateAsync({
          sale_id: saleId,
          method: paymentMethod,
          amount: saleTotal,
          ...paymentData,
        });

        if (!paymentResponse.success) {
          throw new Error(
            paymentResponse.error?.message ?? 'Failed to process payment'
          );
        }

        // Clear cart on success
        clearCart();

        return { sale: saleData, sale_id: saleId, payment: paymentResponse.data };
      } catch (error) {
        // Error is handled by mutation hooks (toast)
        throw error;
      }
    },
    [
      cart,
      totals.total,
      createSaleMutation,
      processPaymentMutation,
      clearCart,
      pendingSale,
      isWednesdayDiscountEnabled,
    ]
  );

  const hasPendingSale = !!pendingSale;

  return {
    // State
    searchQuery,
    setSearchQuery,
    cart,
    products,
    isLoadingProducts,
    totals,
    isWednesdayDiscountAvailable,
    isWednesdayDiscountEnabled,
    pendingSale,
    hasPendingSale,

    // Actions
    addToCart,
    updateQuantity,
    removeFromCart,
    updateWednesdayDiscountEnabled,
    clearCart,
    processCheckout,

    // Loading states
    isProcessing: createSaleMutation.isPending || processPaymentMutation.isPending,
  };
}
