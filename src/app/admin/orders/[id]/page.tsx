import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, MapPin, CreditCard, Calendar, User } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatPrice, formatDate, formatDateTime } from '@/lib/formatters';
import { OrderStatusUpdater } from './OrderStatusUpdater';

export const dynamic = 'force-dynamic';

interface AdminOrderDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      shippingAddress: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#86868b] hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
      </div>

      {/* Header */}
      <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white font-mono">#{order.orderNumber}</h1>
            <span className="px-3 py-1 rounded-full text-[10px] font-medium bg-[#272729] text-[#f5f5f7] border border-[#3e3e42]">
              {order.status}
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-medium bg-[#0066cc]/15 text-[#2997ff] border border-[#0066cc]/30">
              {order.paymentStatus}
            </span>
          </div>
          <p className="text-xs text-[#86868b] mt-1">Placed on {formatDateTime(order.createdAt)}</p>
        </div>

        {/* Live Status Transition Dropdowns */}
        <OrderStatusUpdater
          orderId={order.id}
          currentStatus={order.status}
          currentPaymentStatus={order.paymentStatus}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-[#0066cc]" />
              Line Items ({order.items.length})
            </h3>

            <div className="divide-y divide-[#333336]">
              {order.items.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 object-contain rounded-[10px] bg-[#272729] p-1 border border-[#3e3e42]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-[10px] bg-[#272729] flex items-center justify-center text-[#86868b]">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-white">{item.title}</p>
                      {item.variantTitle && <p className="text-[#86868b] text-[11px]">{item.variantTitle}</p>}
                      <p className="text-[#86868b] text-[10px] font-mono">SKU: {item.sku || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-white">{formatPrice(item.total)}</p>
                    <p className="text-[#86868b] text-[11px]">{formatPrice(item.price)} × {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-4 border-t border-[#333336] space-y-2 text-xs text-[#86868b]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-white">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[#2997ff]">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? <strong className="text-[#2997ff]">FREE</strong> : formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-[#333336]">
                <span>Total Amount</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="space-y-6">
          <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-3 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-[#0066cc]" />
              Customer
            </h3>
            <div className="space-y-1 text-[#a1a1a6]">
              <p className="font-medium text-white">{order.customerName}</p>
              <p>{order.customerEmail}</p>
              {order.customerPhone && <p>{order.customerPhone}</p>}
            </div>
          </div>

          {order.shippingAddress && (
            <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-3 text-xs">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0066cc]" />
                Shipping Destination
              </h3>
              <div className="space-y-1 text-[#a1a1a6]">
                <p className="font-medium text-white">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          )}

          <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-3 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#0066cc]" />
              Payment Details
            </h3>
            <div className="space-y-1 text-[#a1a1a6]">
              <p><span className="text-[#86868b]">Method:</span> <strong className="text-white font-medium">{order.paymentMethod}</strong></p>
              <p><span className="text-[#86868b]">Status:</span> <strong className="text-[#2997ff] font-medium">{order.paymentStatus}</strong></p>
              <p><span className="text-[#86868b]">Gateway:</span> Simulated Demo Engine</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
