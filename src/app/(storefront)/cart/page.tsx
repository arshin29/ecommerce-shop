'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Tag, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/formatters';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    discountAmount,
    shippingAmount,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    freeShippingThreshold,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplying(true);
    setCouponError('');
    setCouponSuccess('');

    const res = await applyCoupon(couponCode.trim());
    setApplying(false);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponCode('');
    } else {
      setCouponError(res.message);
    }
  };

  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white px-4">
        <div className="max-w-md w-full text-center space-y-4 py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#86868b]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Your Bag is empty.</h1>
          <p className="text-sm text-[#86868b] leading-relaxed">
            Items added to your bag from our catalog will appear here. Enjoy complimentary delivery on eligible orders.
          </p>
          <div className="pt-4">
            <Link
              href="/products"
              className="apple-btn inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0066cc] text-white text-sm font-medium hover:bg-[#0077ed] transition"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f]">
      {/* Page Header */}
      <section className="border-b border-[#d2d2d7]/50 pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f]">
              Review your Bag.
            </h1>
            <p className="text-xs sm:text-sm text-[#86868b] mt-1">
              Free delivery and free returns on all orders.
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-medium text-[#86868b] hover:text-[#e03e3e] transition self-start sm:self-auto"
          >
            Remove all items
          </button>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Free Shipping Pill Progress */}
        <div className="mb-8 p-4 rounded-[18px] bg-[#f5f5f7] border border-[#d2d2d7]/40">
          <div className="flex justify-between items-center text-xs mb-2">
            {remainingForFreeShipping > 0 ? (
              <span className="text-[#1d1d1f]">
                Add <strong className="font-semibold text-[#0066cc]">{formatPrice(remainingForFreeShipping)}</strong> more for <span className="font-medium">Free Express Shipping</span>.
              </span>
            ) : (
              <span className="text-[#0066cc] font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0066cc]" /> You qualify for Free Express Shipping
              </span>
            )}
            <span className="font-medium text-[#86868b] text-[11px]">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#e5e5e7] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0066cc] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Items List */}
          <div className="lg:col-span-2 divide-y divide-[#d2d2d7]/40">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="py-6 flex gap-6 first:pt-0"
              >
                {/* Product Thumbnail */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#f5f5f7] rounded-[18px] overflow-hidden flex-shrink-0 flex items-center justify-center p-2 border border-[#d2d2d7]/30">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  ) : (
                    <ShoppingBag className="w-8 h-8 text-[#86868b]" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-base font-semibold text-[#1d1d1f] tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-base font-semibold text-[#1d1d1f]">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    {item.variantTitle && (
                      <p className="text-xs text-[#86868b] mt-0.5">{item.variantTitle}</p>
                    )}
                    <p className="text-xs text-[#86868b] mt-1">
                      {formatPrice(item.price)} each
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between mt-4">
                    {/* Apple pill counter */}
                    <div className="inline-flex items-center rounded-full bg-[#f5f5f7] border border-[#d2d2d7]/60 px-2 py-0.5">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-[#1d1d1f] hover:text-[#0066cc] transition text-xs"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-semibold text-[#1d1d1f] min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-[#1d1d1f] hover:text-[#0066cc] transition text-xs"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-xs text-[#86868b] hover:text-[#0066cc] transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Card */}
          <div className="bg-[#f5f5f7] rounded-[18px] p-6 border border-[#d2d2d7]/40 space-y-6">
            <h2 className="text-lg font-bold text-[#1d1d1f] tracking-tight">Order Summary</h2>

            {/* Calculations */}
            <div className="space-y-3 text-xs text-[#1d1d1f]">
              <div className="flex justify-between">
                <span className="text-[#86868b]">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#0066cc]">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Coupon ({appliedCoupon?.code})
                  </span>
                  <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-[#86868b]">Shipping</span>
                <span className="font-medium">
                  {shippingAmount === 0 ? (
                    <span className="text-[#0066cc] font-semibold">FREE</span>
                  ) : (
                    formatPrice(shippingAmount)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-[#d2d2d7]/60 flex justify-between items-baseline">
                <span className="text-sm font-bold text-[#1d1d1f]">Total</span>
                <span className="text-2xl font-bold tracking-tight text-[#1d1d1f]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="pt-2 border-t border-[#d2d2d7]/40">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-full bg-white border border-[#d2d2d7]/60 text-xs">
                  <span className="font-semibold text-[#0066cc] flex items-center gap-1.5 pl-2">
                    <Tag className="w-3.5 h-3.5" /> {appliedCoupon.code} applied
                  </span>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-[#86868b] hover:text-[#e03e3e] pr-2 transition"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. WELCOME10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-2 text-xs bg-white border border-[#d2d2d7] rounded-full uppercase placeholder:normal-case focus:outline-none focus:border-[#0066cc] transition"
                    />
                    <button
                      type="submit"
                      disabled={applying || !couponCode.trim()}
                      className="apple-btn px-4 py-2 text-xs font-medium rounded-full bg-[#1d1d1f] text-white hover:bg-black disabled:opacity-40 transition"
                    >
                      {applying ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-[#e03e3e] pl-2">{couponError}</p>}
                  {couponSuccess && <p className="text-[11px] text-[#0066cc] pl-2">{couponSuccess}</p>}
                </form>
              )}
            </div>

            {/* Primary Checkout Button */}
            <div className="pt-2">
              <Link
                href="/checkout"
                className="apple-btn w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-[#0066cc] text-white font-medium text-sm hover:bg-[#0077ed] transition shadow-sm"
              >
                Check Out <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust badge */}
            <div className="text-center pt-2">
              <p className="text-[11px] text-[#86868b] flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#86868b]" />
                Encrypted checkout with Demo Payment processing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
