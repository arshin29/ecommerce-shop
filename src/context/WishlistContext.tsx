'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
  images?: Array<{ url: string; alt?: string | null; isPrimary?: boolean }>;
  category?: { name: string; slug: string };
  variants?: Array<{ id: string; title: string; price: number; stock: number; sku: string }>;
}

interface WishlistContextType {
  items: WishlistProduct[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: WishlistProduct) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'nexa_wishlist_items';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 1. Initial load from localStorage
  useEffect(() => {
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) {
        setItems(JSON.parse(local));
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  // 2. Sync with backend when authenticated
  useEffect(() => {
    if (!mounted) return;

    if (user) {
      fetch('/api/wishlist')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.items)) {
            // Merge with local items if any
            setItems((prev) => {
              const combined = [...data.items];
              for (const localItem of prev) {
                if (!combined.some((c) => c.id === localItem.id)) {
                  combined.push(localItem);
                  // Fire background sync to DB
                  fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: localItem.id }),
                  }).catch(() => {});
                }
              }
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(combined));
              return combined;
            });
          }
        })
        .catch(() => {});
    }
  }, [user, mounted]);

  // Persist to localStorage whenever items change
  const updateItems = (newItems: WishlistProduct[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newItems));
    } catch {
      // ignore
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return items.some((item) => item.id === productId);
  };

  const toggleWishlist = async (product: WishlistProduct) => {
    const exists = isInWishlist(product.id);
    let updated: WishlistProduct[];

    if (exists) {
      updated = items.filter((item) => item.id !== product.id);
    } else {
      updated = [product, ...items];
    }

    updateItems(updated);

    // Call server API
    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
    } catch {
      // Keep optimistic local update
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const updated = items.filter((item) => item.id !== productId);
    updateItems(updated);

    try {
      await fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, {
        method: 'DELETE',
      });
    } catch {
      // Keep optimistic local update
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        wishlistCount: items.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        isWishlistOpen,
        setIsWishlistOpen,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
