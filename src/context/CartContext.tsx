'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItemType {
  productId: string;
  variantId?: string;
  title: string;
  variantTitle?: string;
  price: number;
  image?: string;
  quantity: number;
  stock: number;
  sku?: string;
}

export interface AppliedCoupon {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderAmount?: number | null;
}

interface CartContextType {
  items: CartItemType[];
  addItem: (item: CartItemType) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  clearCart: () => void;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  freeShippingThreshold: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const freeShippingThreshold = 999.0;

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem('aura_cart_items');
      const savedCoupon = localStorage.getItem('aura_cart_coupon');
      if (savedItems) setItems(JSON.parse(savedItems));
      if (savedCoupon) setAppliedCoupon(JSON.parse(savedCoupon));
    } catch {
      // ignore parsing errors
    }
    setMounted(true);
  }, []);

  // Save to localStorage when items/coupon changes
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('aura_cart_items', JSON.stringify(items));
      if (appliedCoupon) {
        localStorage.setItem('aura_cart_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('aura_cart_coupon');
      }
    } catch {
      // ignore storage errors
    }
  }, [items, appliedCoupon, mounted]);

  const addItem = (newItem: CartItemType) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(
          updated[existingIndex].quantity + newItem.quantity,
          newItem.stock || 99
        );
        updated[existingIndex].quantity = newQty;
        return updated;
      }
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, variantId: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          return { ...item, quantity: Math.min(quantity, item.stock || 99) };
        }
        return item;
      })
    );
  };

  const removeItem = (productId: string, variantId?: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.variantId === variantId)
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    try {
      localStorage.removeItem('aura_cart_items');
      localStorage.removeItem('aura_cart_coupon');
    } catch {
      // ignore
    }
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/cart/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        setAppliedCoupon(data.coupon);
        return { success: true, message: `Coupon ${data.coupon.code} applied!` };
      }
      return { success: false, message: data.message || 'Invalid coupon code' };
    } catch {
      return { success: false, message: 'Failed to validate coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * appliedCoupon.value) / 100;
    } else {
      discountAmount = Math.min(appliedCoupon.value, subtotal);
    }
  }

  const shippingAmount = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99.0;
  const total = Math.max(0, subtotal - discountAmount + shippingAmount);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        itemCount,
        subtotal,
        discountAmount,
        shippingAmount,
        total,
        freeShippingThreshold,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
