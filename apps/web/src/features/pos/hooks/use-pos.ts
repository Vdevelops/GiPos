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

  const getProductAvailableStock = useCallback((product: Product | undefined | null) => {
    const quantity = product?.stocks?.[0]?.quantity ?? 0;
    const reserved = product?.stocks?.[0]?.reserved ?? 0;
    return Math.max(0, quantity - reserved);
  }, []);

  // Add product to cart
  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      if (pendingSale) {
        return prev;
      }

      const existingItem = prev.find(
        (item) => item.product?.id === product?.id
      );
      const available = getProductAvailableStock(product);
      if (available <= 0) {
        return prev;
      }

      if (existingItem) {
        if ((existingItem.quantity ?? 0) >= available) {
          return prev;
        }

        return prev.map((item) =>
          item.product?.id === product?.id
            ? { ...item, quantity: (item.quantity ?? 0) + 1 }
            : item
        );
      }

      return [...prev, { product, quantity: 1 }];
    });
  }, [getProductAvailableStock, pendingSale]);

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
            const available = getProductAvailableStock(item.product);
            const nextQty = currentQty + delta;

            if (delta > 0) {
              return {
                ...item,
                quantity: Math.min(available, Math.max(0, nextQty)),
              };
            }

            return {
              ...item,
              quantity: Math.max(0, nextQty),
            };
          })
          .filter((item) => (item.quantity ?? 0) > 0);
      }
    );
  }, [getProductAvailableStock, pendingSale]);

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
    const subtotal =
      cart.reduce((sum, item) => {
        const product = item.product;
        const price = product?.price ?? 0;
        const quantity = item.quantity ?? 0;
        return sum + price * quantity;
      }, 0) ?? 0;

    const discountPercent = isWednesdayDiscountEnabled ? 20 : 0;
    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    const total = Math.max(0, subtotal - discountAmount);

    return {
      subtotal,
      discountPercent,
      discountAmount,
      total,
    };
  }, [cart, isWednesdayDiscountAvailable, isWednesdayDiscountEnabled]);

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

        if (!pendingSale) {
          for (const item of cart) {
            const available = getProductAvailableStock(item.product);
            if ((item.quantity ?? 0) > available) {
              throw new Error(`Insufficient stock for ${item.product?.name ?? 'product'}`);
            }
          }
        }

        let saleId = pendingSale?.id;
        let saleTotal = pendingSale?.total ?? totals.total;
        let saleData = null;

        // Create sale once. If payment fails, keep pendingSale and retry payment using same sale_id.
        if (!saleId) {
          const saleItems = cart.map((item) => ({
            product_id: item.product?.id ?? '',
            quantity: item.quantity ?? 0,
            unit_price: item.product?.price ?? null,
          }));

          const saleResponse = await createSaleMutation.mutateAsync({
            outlet_id: normalizedOutletId,
            shift_id: shiftId,
            items: saleItems,
            discount_percent: totals.discountPercent > 0 ? totals.discountPercent : undefined,
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
      totals.discountPercent,
      createSaleMutation,
      processPaymentMutation,
      clearCart,
      pendingSale,
      getProductAvailableStock,
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
