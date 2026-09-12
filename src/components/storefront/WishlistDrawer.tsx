'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Trash2, ShoppingBag, Heart, ArrowRight, Check } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/formatters';

export function WishlistDrawer() {
  const { items, isWishlistOpen, setIsWishlistOpen, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();

  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [deleteFromWishlist, setDeleteFromWishlist] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  if (!isWishlistOpen) return null;

  const startAddToCart = (item: (typeof items)[0]) => {
    setActiveItemId(item.id);
    setQuantity(1);
    setDeleteFromWishlist(true);
  };

  const handleConfirmAddToCart = (item: (typeof items)[0]) => {
    const defaultVariant = item.variants?.[0];
    const stock = defaultVariant?.stock ?? 10;

    addItem({
      productId: item.id,
      variantId: defaultVariant?.id,
      title: item.name,
      variantTitle: defaultVariant?.title,
      price: defaultVariant?.price ?? item.price,
      image: item.images?.[0]?.url || '',
      quantity,
      stock,
      sku: defaultVariant?.sku,
    });

    if (deleteFromWishlist) {
      removeFromWishlist(item.id);
      setNotification(`Added ${quantity} to bag & removed from wishlist`);
    } else {
      setNotification(`Added ${quantity} to bag (kept in wishlist)`);
    }

    setActiveItemId(null);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Apple Backdrop Blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsWishlistOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#d2d2d7]/50 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[#e5e5e7] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#fff0f0] flex items-center justify-center text-[#e03e3e]">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <h2 className="text-lg font-bold text-[#1d1d1f] tracking-tight">
                Wishlist ({items.length})
              </h2>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-2 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition"
              aria-label="Close Wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Feedback banner */}
          {notification && (
            <div className="px-6 py-2.5 bg-[#eefbf1] border-b border-[#d1f2d9] text-[#248a3d] text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto text-[#86868b]">
                  <Heart className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-[#1d1d1f]">Your wishlist is empty</p>
                  <p className="text-xs text-[#86868b] max-w-xs mx-auto">
                    Save items you like while browsing to keep track of them or buy later.
                  </p>
                </div>
                <Link
                  href="/products"
                  onClick={() => setIsWishlistOpen(false)}
                  className="apple-btn inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0066cc] text-white text-xs font-medium hover:bg-[#0071e3] transition shadow-xs"
                >
                  Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  const image =
                    item.images?.find((img) => img.isPrimary)?.url ||
                    item.images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

                  const defaultVariant = item.variants?.[0];
                  const stock = defaultVariant?.stock ?? 10;
                  const isConfiguring = activeItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-[16px] border transition ${
                        isConfiguring
                          ? 'bg-white border-[#0066cc] shadow-md ring-1 ring-[#0066cc]/20'
                          : 'bg-[#f5f5f7] border-[#e5e5e7] hover:border-[#d2d2d7]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        {/* Product Thumbnail */}
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={() => setIsWishlistOpen(false)}
                          className="w-16 h-16 rounded-[10px] bg-white border border-[#d2d2d7]/50 overflow-hidden flex-shrink-0"
                        >
                          <img
                            src={image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </Link>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={() => setIsWishlistOpen(false)}
                            className="block text-xs font-semibold text-[#1d1d1f] hover:text-[#0066cc] transition truncate"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs font-semibold text-[#1d1d1f] mt-0.5">
                            {formatPrice(item.price)}
                          </p>
                          <span className="inline-block mt-0.5 text-[10px] text-[#34c759] font-medium">
                            In Stock ({stock} available)
                          </span>
                        </div>

                        {/* Quick Trigger Button / Remove */}
                        {!isConfiguring && (
                          <div className="flex flex-col items-end gap-2">
                            <button
                              onClick={() => startAddToCart(item)}
                              className="apple-btn px-3 py-1.5 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white text-[11px] font-medium transition flex items-center gap-1 shadow-xs"
                              title="Add to Bag"
                            >
                              <ShoppingBag className="w-3 h-3" />
                              <span>Add to Bag</span>
                            </button>
                            <button
                              onClick={() => removeFromWishlist(item.id)}
                              className="text-[#86868b] hover:text-[#e03e3e] transition p-1"
                              title="Remove from Wishlist"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Interactive Add to Cart Configurator */}
                      {isConfiguring && (
                        <div className="mt-3 pt-3 border-t border-[#e5e5e7] space-y-3">
                          {/* Quantity Selector */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#1d1d1f]">Select Quantity:</span>
                            <div className="flex items-center border border-[#d2d2d7] rounded-full bg-[#f5f5f7] px-2.5 py-1">
                              <button
                                type="button"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-2 text-xs font-bold text-[#86868b] hover:text-[#1d1d1f]"
                              >
                                -
                              </button>
                              <span className="px-2.5 text-xs font-bold text-[#1d1d1f] min-w-[24px] text-center font-mono">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                                disabled={quantity >= stock}
                                className="px-2 text-xs font-bold text-[#86868b] hover:text-[#1d1d1f] disabled:opacity-30"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Live Total */}
                          <div className="flex items-center justify-between text-xs text-[#86868b]">
                            <span>Item Total:</span>
                            <span className="font-semibold text-[#1d1d1f]">
                              {formatPrice(item.price * quantity)}
                            </span>
                          </div>

                          {/* Delete from Wishlist Option */}
                          <div className="p-2.5 rounded-[10px] bg-[#f5f5f7] border border-[#e5e5e7]">
                            <label className="flex items-center gap-2 text-xs text-[#1d1d1f] cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={deleteFromWishlist}
                                onChange={(e) => setDeleteFromWishlist(e.target.checked)}
                                className="rounded text-[#0066cc] focus:ring-0 w-4 h-4 accent-[#0066cc]"
                              />
                              <span className="font-medium">
                                Remove from wishlist when added to bag
                              </span>
                            </label>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleConfirmAddToCart(item)}
                              className="apple-btn flex-1 py-2 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white text-xs font-medium transition shadow-xs flex items-center justify-center gap-1.5"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Add {quantity} to Bag</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveItemId(null)}
                              className="px-3.5 py-2 rounded-full text-xs text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#e5e5e7] bg-[#fafafa] space-y-3">
              <Link
                href="/wishlist"
                onClick={() => setIsWishlistOpen(false)}
                className="apple-btn w-full py-3 rounded-full bg-[#1d1d1f] hover:bg-black text-white text-xs font-medium transition flex items-center justify-center gap-2 shadow-xs"
              >
                View Full Wishlist Page <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
