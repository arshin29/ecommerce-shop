'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/formatters';

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    subtotal,
    discountAmount,
    shippingAmount,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    freeShippingThreshold,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [applying, setApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplying(true);
    setCouponError('');
    setCouponSuccess('');

    const res = await applyCoupon(couponInput.trim());
    setApplying(false);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Apple Backdrop Blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#ffffff] shadow-2xl flex flex-col text-[#1d1d1f]">
          {/* Header */}
          <div className="p-6 border-b border-[#e5e5e7] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[21px] font-semibold text-[#1d1d1f] tracking-tight">Review your Bag</h2>
              <span className="text-[12px] text-[#86868b] font-medium">({items.length} items)</span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Shipping Meter in Apple subtle style */}
          <div className="bg-[#f5f5f7] px-6 py-3 border-b border-[#e5e5e7] text-[12px]">
            {remainingForFreeShipping > 0 ? (
              <p className="text-[#1d1d1f] mb-1.5 font-normal">
                Add <strong className="font-semibold text-[#0066cc]">{formatPrice(remainingForFreeShipping)}</strong> more to qualify for free express delivery.
              </p>
            ) : (
              <p className="text-[#34c759] mb-1.5 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Your order ships free!
              </p>
            )}
            <div className="w-full h-1 bg-[#e5e5e7] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0066cc] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#86868b]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-[17px] font-semibold text-[#1d1d1f]">Your Bag is empty.</h3>
                <p className="text-[13px] text-[#86868b] max-w-xs mx-auto">
                  Browse our catalog to select your essential hardware and carry goods.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="apple-btn mt-4 px-6 py-2 rounded-full bg-[#0066cc] text-white text-[13px] font-medium hover:bg-[#0071e3] transition"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-4 p-4 rounded-[14px] bg-[#f5f5f7] border border-[#e5e5e7]"
                >
                  <div className="w-20 h-20 bg-white rounded-[10px] overflow-hidden flex-shrink-0 border border-black/5">
                    {item.image && (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-[14px] font-semibold text-[#1d1d1f] line-clamp-1">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-[#86868b] hover:text-[#e30000] transition ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {item.variantTitle && (
                        <p className="text-[12px] text-[#86868b]">{item.variantTitle}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[#d2d2d7] rounded-full bg-white">
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          className="px-2 py-0.5 text-[#86868b] hover:text-[#1d1d1f]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-[12px] font-medium text-[#1d1d1f]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="px-2 py-0.5 text-[#86868b] hover:text-[#1d1d1f] disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-[14px] font-semibold text-[#1d1d1f]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#e5e5e7] bg-[#f5f5f7] space-y-4">
              {/* Promo code */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-white border border-[#e5e5e7] rounded-full px-4 py-2 text-[12px]">
                    <div className="flex items-center gap-1.5 text-[#1d1d1f]">
                      <Tag className="w-3.5 h-3.5 text-[#0066cc]" />
                      <span>Code: <strong>{appliedCoupon.code}</strong></span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-[#e30000] text-[11px] font-medium hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. WELCOME10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-4 py-1.5 text-[12px] bg-white border border-[#d2d2d7] rounded-full focus:outline-none focus:border-[#0066cc] uppercase font-mono"
                    />
                    <button
                      type="submit"
                      disabled={applying || !couponInput.trim()}
                      className="apple-btn px-4 py-1.5 text-[12px] font-medium bg-[#1d1d1f] text-white rounded-full hover:bg-black disabled:opacity-40 transition"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-[#e30000] mt-1">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-[#34c759] mt-1">{couponSuccess}</p>}
              </div>

              {/* Calculations */}
              <div className="space-y-2 text-[13px] text-[#86868b] border-t border-[#e5e5e7] pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#1d1d1f] font-medium">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#34c759]">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingAmount === 0 ? <strong className="text-[#34c759]">FREE</strong> : formatPrice(shippingAmount)}</span>
                </div>
                <div className="flex justify-between text-[17px] font-semibold text-[#1d1d1f] pt-2 border-t border-[#d2d2d7]">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="apple-btn w-full py-3 px-4 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white text-[14px] font-medium flex items-center justify-center gap-2 transition shadow-xs"
              >
                Check Out <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
