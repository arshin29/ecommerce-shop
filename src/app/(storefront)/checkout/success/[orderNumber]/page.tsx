import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, Truck, ArrowRight, Calendar, MapPin, CreditCard, ShieldCheck } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/formatters';

export const dynamic = 'force-dynamic';

interface SuccessPageProps {
  params: Promise<{
    orderNumber: string;
  }>;
}

export default async function OrderSuccessPage({ params }: SuccessPageProps) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      shippingAddress: true,
    },
  });

  if (!order) {
    notFound();
  }

  const estimatedDelivery = new Date(order.createdAt);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Apple Order Confirmation Hero */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#f5f5f7] text-[#0066cc] flex items-center justify-center mx-auto mb-4 border border-[#d2d2d7]/40">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0066cc]">
            Order Confirmed
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f]">
            Thank you for your order.
          </h1>
          <p className="text-sm text-[#86868b] max-w-md mx-auto">
            We&apos;ve received your simulated purchase. A confirmation receipt has been generated and saved to your Neon database.
          </p>
          <div className="pt-2">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#f5f5f7] border border-[#d2d2d7]/50 font-mono text-xs font-medium text-[#1d1d1f]">
              Order #{order.orderNumber}
            </span>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-[#f5f5f7] rounded-[18px] border border-[#d2d2d7]/40 p-6 sm:p-8 space-y-6">
          {/* Key metadata tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-[#d2d2d7]/50 text-xs">
            <div className="space-y-1">
              <span className="text-[#86868b] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0066cc]" /> Placed
              </span>
              <p className="font-semibold text-[#1d1d1f]">{formatDate(order.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#86868b] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#0066cc]" /> Estimated Delivery
              </span>
              <p className="font-semibold text-[#1d1d1f]">{formatDate(estimatedDelivery)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#86868b] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#0066cc]" /> Payment Status
              </span>
              <p className="font-semibold text-[#0066cc] uppercase tracking-wide text-[11px]">
                {order.paymentStatus}
              </p>
            </div>
          </div>

          {/* Purchased Items */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">
              Items in this Shipment
            </h3>
            <div className="bg-white rounded-[14px] border border-[#d2d2d7]/40 divide-y divide-[#d2d2d7]/40 p-4">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center text-xs first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 object-contain rounded-[10px] bg-[#f5f5f7] p-1 border border-[#d2d2d7]/30"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-[10px] bg-[#f5f5f7] flex items-center justify-center text-[#86868b]">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-[#1d1d1f]">{item.title}</p>
                      {item.variantTitle && <p className="text-[#86868b] text-[11px]">{item.variantTitle}</p>}
                      <p className="text-[#86868b]">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-[#1d1d1f]">{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address & Receipt Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {order.shippingAddress && (
              <div className="text-xs space-y-1">
                <span className="font-semibold uppercase tracking-wider text-[#86868b] text-[10px]">
                  Shipping Address
                </span>
                <p className="font-medium text-[#1d1d1f]">{order.shippingAddress.fullName}</p>
                <p className="text-[#86868b]">{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p className="text-[#86868b]">{order.shippingAddress.addressLine2}</p>}
                <p className="text-[#86868b]">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p className="text-[#86868b]">{order.shippingAddress.country}</p>
              </div>
            )}

            <div className="text-xs space-y-2 sm:text-right">
              <span className="font-semibold uppercase tracking-wider text-[#86868b] text-[10px]">
                Total Breakdown
              </span>
              <div className="space-y-1">
                <div className="flex justify-between sm:justify-end gap-6 text-[#86868b]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#1d1d1f]">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between sm:justify-end gap-6 text-[#0066cc]">
                    <span>Discount</span>
                    <span className="font-semibold">-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between sm:justify-end gap-6 text-[#86868b]">
                  <span>Shipping</span>
                  <span className="font-medium text-[#1d1d1f]">{formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between sm:justify-end gap-6 font-bold text-sm text-[#1d1d1f] pt-2 border-t border-[#d2d2d7]/50">
                  <span>Total Paid</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/products"
            className="apple-btn w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#0066cc] text-white text-xs font-medium hover:bg-[#0077ed] transition text-center"
          >
            Continue Shopping
          </Link>
          <Link
            href="/account"
            className="apple-btn w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#f5f5f7] border border-[#d2d2d7]/60 text-[#1d1d1f] text-xs font-medium hover:bg-[#e8e8ed] transition text-center"
          >
            View Account Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
