'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, ArrowRight, Check, X, Sparkles } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/formatters';

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();

  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [deleteFromWishlist, setDeleteFromWishlist] = useState<boolean>(true);

  // Bulk move modal state
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [bulkDeleteFromWishlist, setBulkDeleteFromWishlist] = useState<boolean>(true);

  // Feedback notification
  const [notification, setNotification] = useState<string | null>(null);

  const startAddToCart = (itemId: string) => {
    setActiveItemId(itemId);
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
      setNotification(`Added ${quantity} × ${item.name} to bag and removed from wishlist.`);
    } else {
      setNotification(`Added ${quantity} × ${item.name} to bag (kept in your wishlist).`);
    }

    setActiveItemId(null);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleConfirmBulkMove = () => {
    for (const item of items) {
      const defaultVariant = item.variants?.[0];
      const stock = defaultVariant?.stock ?? 10;

      addItem({
        productId: item.id,
        variantId: defaultVariant?.id,
        title: item.name,
        variantTitle: defaultVariant?.title,
        price: defaultVariant?.price ?? item.price,
        image: item.images?.[0]?.url || '',
        quantity: 1,
        stock,
        sku: defaultVariant?.sku,
      });

      if (bulkDeleteFromWishlist) {
        removeFromWishlist(item.id);
      }
    }

    setShowBulkModal(false);
    if (bulkDeleteFromWishlist) {
      setNotification(`All ${items.length} items moved to bag and removed from wishlist.`);
    } else {
      setNotification(`All ${items.length} items added to bag (kept in wishlist).`);
    }
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="bg-[#f5f5f7] min-h-screen py-10 sm:py-16">
      <div className="max-w-[1024px] mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#d2d2d7]/60 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#d2d2d7]/60 text-[11px] font-semibold text-[#e03e3e]">
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Saved Items ({items.length})</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f]">
              Your Wishlist
            </h1>
            <p className="text-xs text-[#86868b]">
              Items saved for later. Select quantities and choose whether to keep or remove items when moving them to your bag.
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={() => setShowBulkModal(true)}
              className="apple-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white text-xs font-medium transition shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Move All to Bag</span>
            </button>
          )}
        </div>

        {/* Feedback Banner */}
        {notification && (
          <div className="p-4 rounded-[14px] bg-[#eefbf1] border border-[#d1f2d9] text-[#248a3d] text-xs font-medium flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{notification}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-[#248a3d] hover:opacity-75"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Wishlist Grid or Empty State */}
        {items.length === 0 ? (
          <div className="bg-white rounded-[18px] border border-[#d2d2d7]/50 p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto text-[#86868b]">
              <Heart className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#1d1d1f]">Your wishlist is empty</h2>
              <p className="text-xs text-[#86868b] max-w-sm mx-auto">
                Explore our curated catalog and tap the heart icon on any product to save it here.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/products"
                className="apple-btn inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white text-xs font-medium transition shadow-xs"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  className={`group bg-white rounded-[18px] border p-5 flex flex-col justify-between space-y-4 shadow-2xs transition ${
                    isConfiguring
                      ? 'border-[#0066cc] ring-2 ring-[#0066cc]/20 shadow-md'
                      : 'border-[#d2d2d7]/50 hover:border-[#d2d2d7]'
                  }`}
                >
                  {/* Image */}
                  <div className="relative aspect-square w-full rounded-[12px] bg-[#f5f5f7] overflow-hidden">
                    <Link href={`/products/${item.slug}`} className="block w-full h-full">
                      <img
                        src={image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#86868b] hover:text-[#e03e3e] hover:bg-white transition shadow-xs"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    {item.category && (
                      <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">
                        {item.category.name}
                      </span>
                    )}
                    <Link
                      href={`/products/${item.slug}`}
                      className="block text-sm font-semibold text-[#1d1d1f] hover:text-[#0066cc] transition truncate"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-baseline gap-2 pt-0.5">
                      <span className="text-base font-bold text-[#1d1d1f]">
                        {formatPrice(item.price)}
                      </span>
                      {item.compareAtPrice && item.compareAtPrice > item.price && (
                        <span className="text-xs text-[#86868b] line-through">
                          {formatPrice(item.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Normal Actions */}
                  {!isConfiguring ? (
                    <div className="pt-2 border-t border-[#f5f5f7] flex items-center gap-2">
                      <button
                        onClick={() => startAddToCart(item.id)}
                        className="apple-btn flex-1 py-2.5 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white text-xs font-medium transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Bag</span>
                      </button>
                      <Link
                        href={`/products/${item.slug}`}
                        className="apple-btn px-4 py-2.5 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-xs font-medium transition"
                      >
                        View
                      </Link>
                    </div>
                  ) : (
                    /* Active Configurator with Quantity Stepper & Delete Checkbox */
                    <div className="pt-3 border-t border-[#e5e5e7] space-y-3 bg-[#fafafa] -mx-5 -mb-5 p-5 rounded-b-[18px]">
                      {/* Quantity Stepper */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#1d1d1f]">Quantity:</span>
                        <div className="flex items-center border border-[#d2d2d7] rounded-full bg-white px-2.5 py-1 shadow-2xs">
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

                      {/* Total */}
                      <div className="flex items-center justify-between text-xs text-[#86868b]">
                        <span>Subtotal:</span>
                        <span className="font-semibold text-[#1d1d1f]">
                          {formatPrice(item.price * quantity)}
                        </span>
                      </div>

                      {/* Delete from Wishlist Option */}
                      <div className="p-2.5 rounded-[10px] bg-white border border-[#d2d2d7]/50">
                        <label className="flex items-center gap-2 text-xs text-[#1d1d1f] cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={deleteFromWishlist}
                            onChange={(e) => setDeleteFromWishlist(e.target.checked)}
                            className="rounded text-[#0066cc] focus:ring-0 w-4 h-4 accent-[#0066cc]"
                          />
                          <span className="font-medium">
                            Remove from wishlist after adding
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
                          <span>Confirm & Add ({quantity})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveItemId(null)}
                          className="px-3.5 py-2 rounded-full text-xs text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#e8e8ed] transition"
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

      {/* Bulk Move Modal Dialog */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowBulkModal(false)}
          />

          <div className="relative bg-white rounded-[20px] max-w-md w-full p-6 space-y-5 shadow-2xl border border-[#d2d2d7]/50">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#1d1d1f] tracking-tight">
                  Move All Items to Bag
                </h3>
                <p className="text-xs text-[#86868b]">
                  Add all {items.length} items from your wishlist to your shopping bag.
                </p>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="p-1 rounded-full text-[#86868b] hover:text-[#1d1d1f]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Option to Delete or Keep in Wishlist */}
            <div className="p-3.5 rounded-[12px] bg-[#f5f5f7] border border-[#e5e5e7]">
              <label className="flex items-center gap-2.5 text-xs text-[#1d1d1f] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={bulkDeleteFromWishlist}
                  onChange={(e) => setBulkDeleteFromWishlist(e.target.checked)}
                  className="rounded text-[#0066cc] focus:ring-0 w-4 h-4 accent-[#0066cc]"
                />
                <span className="font-medium">
                  Remove all items from wishlist after adding to bag
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleConfirmBulkMove}
                className="apple-btn flex-1 py-2.5 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white text-xs font-medium transition shadow-xs flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add {items.length} Items to Bag</span>
              </button>
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2.5 rounded-full text-xs text-[#86868b] hover:bg-[#f5f5f7] transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
