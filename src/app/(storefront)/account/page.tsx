import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, User, MapPin, Clock, ExternalLink, ShieldCheck, Heart } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/formatters';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await getCurrentUser();

  if (!session) {
    redirect('/login?redirect=/account');
  }

  // Fetch orders, addresses, and wishlist from Neon DB for current user
  const [orders, addresses, wishlistItems] = await Promise.all([
    prisma.order.findMany({
      where: {
        OR: [
          { userId: session.userId },
          { customerEmail: session.email },
        ],
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.wishlistItem.findMany({
      where: { userId: session.userId },
      include: {
        product: {
          include: { images: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f]">
      {/* Header */}
      <section className="bg-[#f5f5f7] border-b border-[#d2d2d7]/50 pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center font-semibold text-xl">
              {session.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
                {session.name}
              </h1>
              <p className="text-xs text-[#86868b] mt-0.5">
                {session.email} • <span className="font-medium text-[#1d1d1f]">{session.role}</span>
              </p>
            </div>
          </div>

          {session.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="apple-btn inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#0066cc] text-white text-xs font-medium hover:bg-[#0077ed] transition self-start sm:self-auto shadow-sm"
            >
              <span>Admin Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order History */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-[#d2d2d7]/50 pb-3">
              <h2 className="text-lg font-bold text-[#1d1d1f] tracking-tight flex items-center gap-2">
                <Package className="w-4 h-4 text-[#0066cc]" />
                Your Orders ({orders.length})
              </h2>
            </div>

            {orders.length === 0 ? (
              <div className="bg-[#f5f5f7] rounded-[18px] border border-[#d2d2d7]/40 p-10 text-center">
                <Package className="w-10 h-10 text-[#86868b] mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#1d1d1f]">No orders found yet</p>
                <p className="text-xs text-[#86868b] mt-1 max-w-sm mx-auto">
                  When you place orders through our store, they will be archived here with live status tracking.
                </p>
                <div className="mt-5">
                  <Link
                    href="/products"
                    className="apple-btn inline-block px-5 py-2 rounded-full bg-[#0066cc] text-white text-xs font-medium hover:bg-[#0077ed] transition"
                  >
                    Browse Catalog
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-[#f5f5f7] rounded-[18px] border border-[#d2d2d7]/40 p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d2d2d7]/40 pb-3 text-xs">
                      <div>
                        <span className="font-semibold text-[#1d1d1f] font-mono">#{order.orderNumber}</span>
                        <span className="text-[#86868b] ml-3">{formatDate(order.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full font-medium uppercase text-[10px] bg-white border border-[#d2d2d7]/60 text-[#1d1d1f]">
                          {order.status}
                        </span>
                        <span className="px-3 py-1 rounded-full font-medium uppercase text-[10px] bg-[#0066cc]/10 text-[#0066cc]">
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-10 h-10 object-contain rounded-[10px] bg-white p-1 border border-[#d2d2d7]/30"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-[10px] bg-white flex items-center justify-center text-[#86868b]">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-[#1d1d1f]">{item.title}</p>
                              {item.variantTitle && <p className="text-[#86868b] text-[11px]">{item.variantTitle} × {item.quantity}</p>}
                            </div>
                          </div>
                          <span className="font-semibold text-[#1d1d1f]">{formatPrice(item.total)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-[#d2d2d7]/40 flex items-center justify-between text-xs">
                      <span className="text-[#86868b]">
                        Payment: <strong className="text-[#1d1d1f] font-medium">{order.paymentMethod}</strong>
                      </span>
                      <span className="font-bold text-sm text-[#1d1d1f]">
                        Total: {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile Details Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#f5f5f7] p-6 rounded-[18px] border border-[#d2d2d7]/40 space-y-4">
              <h3 className="text-sm font-bold text-[#1d1d1f] flex items-center gap-2">
                <User className="w-4 h-4 text-[#0066cc]" />
                Account Overview
              </h3>
              <div className="space-y-2 text-xs text-[#1d1d1f]">
                <p><span className="text-[#86868b]">Name:</span> <strong className="font-medium">{session.name}</strong></p>
                <p><span className="text-[#86868b]">Email:</span> <strong className="font-medium">{session.email}</strong></p>
                <p><span className="text-[#86868b]">Role:</span> <strong className="font-medium">{session.role}</strong></p>
                <p><span className="text-[#86868b]">Database ID:</span> <span className="font-mono text-[11px] text-[#86868b]">{session.userId}</span></p>
              </div>
            </div>

            <div className="bg-[#f5f5f7] p-6 rounded-[18px] border border-[#d2d2d7]/40 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1d1d1f] flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#e03e3e] fill-current" />
                  Saved to Wishlist ({wishlistItems.length})
                </h3>
                <Link
                  href="/wishlist"
                  className="text-xs text-[#0066cc] hover:underline font-medium"
                >
                  View All →
                </Link>
              </div>

              {wishlistItems.length === 0 ? (
                <p className="text-xs text-[#86868b] leading-relaxed">
                  No items in your wishlist. Tap the heart icon on any product to save it here.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {wishlistItems.slice(0, 3).map((w) => {
                    const img = w.product.images?.[0]?.url;
                    return (
                      <Link
                        key={w.id}
                        href={`/products/${w.product.slug}`}
                        className="p-2 rounded-[12px] bg-white border border-[#d2d2d7]/40 flex items-center gap-3 hover:border-[#0066cc] transition"
                      >
                        {img && (
                          <img
                            src={img}
                            alt={w.product.name}
                            className="w-10 h-10 rounded-[8px] object-cover bg-[#f5f5f7]"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#1d1d1f] truncate">
                            {w.product.name}
                          </p>
                          <p className="text-[11px] font-medium text-[#1d1d1f]">
                            {formatPrice(w.product.price)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-[#f5f5f7] p-6 rounded-[18px] border border-[#d2d2d7]/40 space-y-4">
              <h3 className="text-sm font-bold text-[#1d1d1f] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0066cc]" />
                Saved Shipping Addresses
              </h3>
              {addresses.length === 0 ? (
                <p className="text-xs text-[#86868b] leading-relaxed">
                  Saved delivery addresses will automatically appear here once checkout orders are finalized.
                </p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="p-3.5 rounded-[12px] bg-white border border-[#d2d2d7]/40 text-xs space-y-0.5">
                      <p className="font-semibold text-[#1d1d1f]">{addr.fullName}</p>
                      <p className="text-[#86868b]">{addr.addressLine1}</p>
                      <p className="text-[#86868b]">{addr.city}, {addr.state} {addr.postalCode}</p>
                      <p className="text-[#86868b]">{addr.country}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
