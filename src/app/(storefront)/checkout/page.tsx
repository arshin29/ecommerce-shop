'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  AlertTriangle,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/formatters';
import { checkoutSchema, CheckoutFormData } from '@/lib/validations';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discountAmount, shippingAmount, total, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [paymentMethod, setPaymentMethod] = useState<'DEMO_CARD' | 'DEMO_UPI' | 'CASH_ON_DELIVERY'>('DEMO_CARD');
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: user?.name || '',
      customerEmail: user?.email || '',
      customerPhone: '+1 (555) 019-2834',
      addressLine1: '1 Apple Park Way',
      city: 'Cupertino',
      state: 'CA',
      postalCode: '95014',
      country: 'United States',
      paymentMethod: 'DEMO_CARD',
      cardNumber: '4242 •••• •••• 4242',
      cardExpiry: '12/28',
      cardCvc: '888',
      upiId: 'shopper@demobank',
    },
  });

  useEffect(() => {
    if (user) {
      setValue('customerName', user.name);
      setValue('customerEmail', user.email);
    }
  }, [user, setValue]);

  if (items.length === 0 && !submitting) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white px-4">
        <div className="max-w-md w-full text-center space-y-4 py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#86868b]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">Your Bag is empty</h1>
          <p className="text-xs text-[#86868b] leading-relaxed">
            Add items to your bag before proceeding to checkout.
          </p>
          <div className="pt-4">
            <Link
              href="/products"
              className="apple-btn inline-block px-6 py-2.5 rounded-full bg-[#0066cc] text-white text-xs font-medium hover:bg-[#0077ed] transition"
            >
              Return to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleNextStep = async () => {
    if (step === 1) {
      const valid = await trigger(['customerName', 'customerEmail', 'customerPhone']);
      if (valid) setStep(2);
    } else if (step === 2) {
      const valid = await trigger(['addressLine1', 'city', 'state', 'postalCode', 'country']);
      if (valid) setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setSubmitting(true);
    setOrderError('');

    try {
      const payload = {
        ...data,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success && result.orderNumber) {
        clearCart();
        router.push(`/checkout/success/${result.orderNumber}`);
      } else {
        setOrderError(result.error || 'Checkout failed. Please verify inputs or stock.');
        setSubmitting(false);
      }
    } catch {
      setOrderError('Network error while processing checkout.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f]">
      {/* Top Header */}
      <section className="border-b border-[#d2d2d7]/50 pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f]">
              Checkout.
            </h1>
            <p className="text-xs text-[#86868b] mt-1">
              Complete your purchase with demo payment processing.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#86868b]">
            <Lock className="w-3.5 h-3.5 text-[#0066cc]" />
            <span>Encrypted Demo Order</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Environment Notice Pill */}
        <div className="mb-8 p-3.5 rounded-[18px] bg-[#f5f5f7] border border-[#d2d2d7]/40 flex items-center gap-3 text-xs text-[#1d1d1f]">
          <ShieldCheck className="w-4 h-4 text-[#0066cc] flex-shrink-0" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-[#1d1d1f]">Simulated Payment Environment:</strong> No actual charges will be incurred. Order records and stock levels will update live in Neon PostgreSQL.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Checkout Steps */}
          <div className="lg:col-span-7 space-y-6">
            {/* Minimalist Apple Step Bar */}
            <div className="flex items-center justify-between border-b border-[#d2d2d7]/50 pb-4 text-xs font-medium">
              {[
                { num: 1, title: 'Contact' },
                { num: 2, title: 'Shipping' },
                { num: 3, title: 'Review' },
                { num: 4, title: 'Payment' },
              ].map((s) => (
                <div
                  key={s.num}
                  className={`flex items-center gap-2 ${
                    step === s.num
                      ? 'text-[#0066cc]'
                      : step > s.num
                      ? 'text-[#1d1d1f]'
                      : 'text-[#86868b]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      step === s.num
                        ? 'bg-[#0066cc] text-white'
                        : step > s.num
                        ? 'bg-[#1d1d1f] text-white'
                        : 'bg-[#e5e5e7] text-[#86868b]'
                    }`}
                  >
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <span className="hidden sm:inline">{s.title}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Contact Information */}
              {step === 1 && (
                <div className="bg-[#f5f5f7] p-6 sm:p-8 rounded-[18px] border border-[#d2d2d7]/40 space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#1d1d1f] tracking-tight">
                      1. Contact Information
                    </h2>
                    <p className="text-xs text-[#86868b] mt-1">
                      We will send your order confirmation and dispatch notices here.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        {...register('customerName')}
                        placeholder="John Appleseed"
                        className="w-full px-4 py-2.5 text-sm bg-white border border-[#d2d2d7] rounded-[12px] focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition"
                      />
                      {errors.customerName && (
                        <p className="text-[11px] text-[#e03e3e] mt-1">{errors.customerName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        {...register('customerEmail')}
                        placeholder="appleseed@example.com"
                        className="w-full px-4 py-2.5 text-sm bg-white border border-[#d2d2d7] rounded-[12px] focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition"
                      />
                      {errors.customerEmail && (
                        <p className="text-[11px] text-[#e03e3e] mt-1">{errors.customerEmail.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">Phone Number *</label>
                      <input
                        type="text"
                        {...register('customerPhone')}
                        placeholder="+1 (555) 019-2834"
                        className="w-full px-4 py-2.5 text-sm bg-white border border-[#d2d2d7] rounded-[12px] focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition"
                      />
                      {errors.customerPhone && (
                        <p className="text-[11px] text-[#e03e3e] mt-1">{errors.customerPhone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="apple-btn px-6 py-2.5 rounded-full bg-[#0066cc] text-white text-xs font-medium hover:bg-[#0077ed] transition flex items-center gap-2"
                    >
                      Continue to Shipping <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Address */}
              {step === 2 && (
                <div className="bg-[#f5f5f7] p-6 sm:p-8 rounded-[18px] border border-[#d2d2d7]/40 space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#1d1d1f] tracking-tight">
                      2. Shipping Address
                    </h2>
                    <p className="text-xs text-[#86868b] mt-1">
                      Where would you like your order delivered?
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">Street Address *</label>
                      <input
                        type="text"
                        {...register('addressLine1')}
                        placeholder="1 Apple Park Way"
                        className="w-full px-4 py-2.5 text-sm bg-white border border-[#d2d2d7] rounded-[12px] focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition"
                      />
                      {errors.addressLine1 && (
                        <p className="text-[11px] text-[#e03e3e] mt-1">{errors.addressLine1.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">Apartment, Suite, Unit (optional)</label>
                      <input
                        type="text"
                        {...register('addressLine2')}
                        placeholder="Suite 400"
                        className="w-full px-4 py-2.5 text-sm bg-white border border-[#d2d2d7] rounded-[12px] focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">City *</label>
                        <input
                          type="text"
                          {...register('city')}
                          placeholder="Cupertino"
                          className="w-full px-4 py-2.5 text-sm bg-white border border-[#d2d2d7] rounded-[12px] focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition"
                        />
                        {errors.city && <p className="text-[11px] text-[#e03e3e] mt-1">{errors.city.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">State / Province *</label>
                        <input
                          type="text"
                          {...register('state')}
                          placeholder="CA"
                          className="w-full px-4 py-2.5 text-sm bg-white border border-[#d2d2d7] rounded-[12px] focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition"
                        />
                        {errors.state && <p className="text-[11px] text-[#e03e3e] mt-1">{errors.state.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">Postal Code *</label>
                        <input
                          type="text"
                          {...register('postalCode')}
                          placeholder="95014"
                          className="w-full px-4 py-2.5 text-sm bg-white border border-[#d2d2d7] rounded-[12px] focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition"
                        />
                        {errors.postalCode && <p className="text-[11px] text-[#e03e3e] mt-1">{errors.postalCode.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">Country *</label>
                        <input
                          type="text"
                          {...register('country')}
                          placeholder="United States"
                          className="w-full px-4 py-2.5 text-sm bg-white border border-[#d2d2d7] rounded-[12px] focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition"
                        />
                        {errors.country && <p className="text-[11px] text-[#e03e3e] mt-1">{errors.country.message}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 text-xs font-medium text-[#86868b] hover:text-[#1d1d1f] transition flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="apple-btn px-6 py-2.5 rounded-full bg-[#0066cc] text-white text-xs font-medium hover:bg-[#0077ed] transition flex items-center gap-2"
                    >
                      Review Order <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review Items */}
              {step === 3 && (
                <div className="bg-[#f5f5f7] p-6 sm:p-8 rounded-[18px] border border-[#d2d2d7]/40 space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#1d1d1f] tracking-tight">
                      3. Order Verification
                    </h2>
                    <p className="text-xs text-[#86868b] mt-1">
                      Please confirm your items before proceeding to demo payment.
                    </p>
                  </div>

                  <div className="divide-y divide-[#d2d2d7]/40 bg-white rounded-[14px] p-4 border border-[#d2d2d7]/40 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={`${item.productId}-${item.variantId}`} className="py-3 flex justify-between items-center text-xs first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-12 h-12 object-contain rounded-[10px] bg-[#f5f5f7] p-1 border border-[#d2d2d7]/30"
                          />
                          <div>
                            <p className="font-semibold text-[#1d1d1f]">{item.title}</p>
                            {item.variantTitle && <p className="text-[#86868b]">{item.variantTitle}</p>}
                            <p className="text-[#86868b]">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-[#1d1d1f]">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2 text-xs font-medium text-[#86868b] hover:text-[#1d1d1f] transition flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="apple-btn px-6 py-2.5 rounded-full bg-[#0066cc] text-white text-xs font-medium hover:bg-[#0077ed] transition flex items-center gap-2"
                    >
                      Select Payment Method <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Demo Payment Selection */}
              {step === 4 && (
                <div className="bg-[#f5f5f7] p-6 sm:p-8 rounded-[18px] border border-[#d2d2d7]/40 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#1d1d1f] tracking-tight">
                      4. Payment Method
                    </h2>
                    <p className="text-xs text-[#86868b] mt-1">
                      Choose a simulated payment channel to complete order placement.
                    </p>
                  </div>

                  {/* Segmented Payment Tabs */}
                  <div className="grid grid-cols-3 gap-2 bg-white p-1.5 rounded-full border border-[#d2d2d7]/60">
                    {[
                      { id: 'DEMO_CARD', label: 'Demo Card', icon: CreditCard },
                      { id: 'DEMO_UPI', label: 'Demo UPI', icon: QrCode },
                      { id: 'CASH_ON_DELIVERY', label: 'Pay on Delivery', icon: Truck },
                    ].map((m) => {
                      const Icon = m.icon;
                      const isSelected = paymentMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`py-2 px-3 rounded-full text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#1d1d1f] text-white shadow-sm'
                              : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="truncate">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Payment Screen Fields */}
                  {paymentMethod === 'DEMO_CARD' && (
                    <div className="p-5 rounded-[14px] bg-white border border-[#d2d2d7]/50 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-[#1d1d1f] mb-1">Simulated Card Number</label>
                        <input
                          type="text"
                          {...register('cardNumber')}
                          className="w-full px-4 py-2.5 text-xs bg-[#f5f5f7] border border-[#d2d2d7] rounded-[10px] font-mono focus:outline-none focus:border-[#0066cc]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-[#1d1d1f] mb-1">Expiry</label>
                          <input
                            type="text"
                            {...register('cardExpiry')}
                            className="w-full px-4 py-2.5 text-xs bg-[#f5f5f7] border border-[#d2d2d7] rounded-[10px] font-mono focus:outline-none focus:border-[#0066cc]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#1d1d1f] mb-1">CVC</label>
                          <input
                            type="text"
                            {...register('cardCvc')}
                            className="w-full px-4 py-2.5 text-xs bg-[#f5f5f7] border border-[#d2d2d7] rounded-[10px] font-mono focus:outline-none focus:border-[#0066cc]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'DEMO_UPI' && (
                    <div className="p-6 rounded-[14px] bg-white border border-[#d2d2d7]/50 text-center space-y-3">
                      <div className="w-24 h-24 mx-auto bg-[#f5f5f7] p-2 rounded-[14px] border border-[#d2d2d7]/40 flex items-center justify-center">
                        <QrCode className="w-16 h-16 text-[#1d1d1f]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#1d1d1f] mb-1">Simulated UPI VPA</label>
                        <input
                          type="text"
                          {...register('upiId')}
                          className="w-full max-w-xs mx-auto px-4 py-2 text-xs bg-[#f5f5f7] border border-[#d2d2d7] rounded-full font-mono text-center focus:outline-none focus:border-[#0066cc]"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'CASH_ON_DELIVERY' && (
                    <div className="p-5 rounded-[14px] bg-white border border-[#d2d2d7]/50 text-xs text-[#1d1d1f] flex items-center gap-3">
                      <Truck className="w-6 h-6 text-[#0066cc] flex-shrink-0" />
                      <span className="leading-relaxed">
                        Pay with cash upon package delivery. You will receive an SMS and email dispatch update when our carrier departs.
                      </span>
                    </div>
                  )}

                  {orderError && (
                    <div className="p-3 rounded-[12px] bg-[#fff2f2] text-[#e03e3e] border border-[#ffcccc] text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>{orderError}</span>
                    </div>
                  )}

                  <div className="pt-4 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-4 py-2 text-xs font-medium text-[#86868b] hover:text-[#1d1d1f] transition flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="apple-btn px-8 py-3.5 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white text-sm font-medium transition flex items-center gap-2 disabled:opacity-60 shadow-sm"
                    >
                      {submitting ? (
                        <>Processing Demo Order...</>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" /> Place Demo Order ({formatPrice(total)})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Order Summary Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#f5f5f7] rounded-[18px] p-6 border border-[#d2d2d7]/40 space-y-5">
              <h3 className="text-base font-bold text-[#1d1d1f] tracking-tight">
                Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h3>

              <div className="divide-y divide-[#d2d2d7]/40 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="py-3 flex justify-between items-center text-xs first:pt-0">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-11 h-11 object-contain rounded-[10px] bg-white p-1 border border-[#d2d2d7]/30"
                      />
                      <div>
                        <p className="font-semibold text-[#1d1d1f] line-clamp-1">{item.title}</p>
                        <p className="text-[#86868b] text-[11px]">{item.variantTitle} × {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-[#1d1d1f]">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {appliedCoupon && (
                <div className="p-3 bg-white rounded-full border border-[#d2d2d7]/60 text-xs text-[#0066cc] flex justify-between items-center px-4">
                  <span className="font-medium">Applied: <strong>{appliedCoupon.code}</strong></span>
                  <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="space-y-2 text-xs text-[#1d1d1f] border-t border-[#d2d2d7]/60 pt-4">
                <div className="flex justify-between">
                  <span className="text-[#86868b]">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#0066cc]">
                    <span>Discount</span>
                    <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#86868b]">Shipping</span>
                  <span className="font-medium">
                    {shippingAmount === 0 ? <span className="text-[#0066cc] font-semibold">FREE</span> : formatPrice(shippingAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#1d1d1f] border-t border-[#d2d2d7]/60 pt-3">
                  <span>Total</span>
                  <span className="text-xl font-bold tracking-tight text-[#1d1d1f]">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
