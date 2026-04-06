'use client';

import { useState, useCallback, useMemo } from 'react';
import { useProducts } from '@/features/products/hooks/use-products';
import { useCreateSale } from './use-sales';
import { useProcessPayment } from './use-payments';
import type { Product } from '@/features/products/types';
import type { CartItem } from '../components/pos-cart';
import { rupiahToSen } from '@/lib/currency';

/**
 * Hook for POS interface
 * Manages cart state and business logic
 */
export function usePOS() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [taxable, setTaxable] = useState(true);

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
  }, []);

  // Update quantity
  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product?.id === productId
            ? {
                ...item,
                quantity: Math.max(0, (item.quantity ?? 0) + delta),
              }
            : item
        )
        .filter((item) => (item.quantity ?? 0) > 0)
    );
  }, []);

  // Remove from cart
  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product?.id !== productId));
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([]);
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

    const taxRate = taxable ? 0.1 : 0;
    const taxAmount = Math.round(subtotal * taxRate);
    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total };
  }, [cart, taxable]);

  // Process checkout
  const processCheckout = useCallback(
    async (
      outletId: string,
      shiftId: string | null,
      paymentMethod: string,
      paymentData: Record<string, unknown>
    ) => {
      try {
        // Create sale items
        const saleItems = cart.map((item) => ({
          product_id: item.product?.id ?? '',
          quantity: item.quantity ?? 0,
          unit_price: item.product?.price ?? null,
        }));

        // Create sale
        const saleResponse = await createSaleMutation.mutateAsync({
          outlet_id: outletId,
          shift_id: shiftId,
          items: saleItems,
          taxable,
          payment_method: paymentMethod as 'cash' | 'qris' | 'e_wallet' | 'transfer' | 'card',
        });

        if (!saleResponse.success || !saleResponse.data) {
          throw new Error(saleResponse.error?.message ?? 'Failed to create sale');
        }

        // Process payment
        const paymentResponse = await processPaymentMutation.mutateAsync({
          sale_id: saleResponse.data.id,
          method: paymentMethod as 'cash' | 'qris' | 'e_wallet' | 'transfer' | 'card',
          amount: totals.total,
          ...paymentData,
        });

        if (!paymentResponse.success) {
          throw new Error(
            paymentResponse.error?.message ?? 'Failed to process payment'
          );
        }

        // Clear cart on success
        clearCart();

        return { sale: saleResponse.data, payment: paymentResponse.data };
      } catch (error) {
        // Error is handled by mutation hooks (toast)
        throw error;
      }
    },
    [cart, taxable, totals.total, createSaleMutation, processPaymentMutation, clearCart]
  );

  return {
    // State
    searchQuery,
    setSearchQuery,
    cart,
    taxable,
    setTaxable,
    products,
    isLoadingProducts,
    totals,

    // Actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    processCheckout,

    // Loading states
    isProcessing: createSaleMutation.isPending || processPaymentMutation.isPending,
  };
}
