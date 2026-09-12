import React from 'react';
import Link from 'next/link';
import { Search, Filter, ShoppingBag, Eye } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/formatters';

export const dynamic = 'force-dynamic';

interface AdminOrdersProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersProps) {
  const params = await searchParams;
  const { search, status } = params;

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerEmail: { contains: search, mode: 'insensitive' } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: true,
      shippingAddress: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Orders</h1>
        <p className="text-xs text-[#86868b] mt-1">
          Review customer purchases, monitor demo payments, and transition fulfillment status.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#161617] p-4 rounded-[18px] border border-[#333336] flex flex-col sm:flex-row gap-3">
        <form action="/admin/orders" method="GET" className="flex-1 relative">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="text"
            name="search"
            defaultValue={search || ''}
            placeholder="Search by order number or customer name/email..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-full text-white placeholder:text-[#86868b] focus:outline-none focus:border-[#0066cc]"
          />
          <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </form>

        {/* Status filter pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <Link
            href="/admin/orders"
            className={`px-3.5 py-1.5 rounded-full font-medium transition ${
              !status
                ? 'bg-[#0066cc] text-white shadow-sm'
                : 'bg-[#272729] text-[#a1a1a6] hover:text-white hover:bg-[#333336]'
            }`}
          >
            All
          </Link>
          {statuses.map((st) => (
            <Link
              key={st}
              href={`/admin/orders?status=${st}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
              className={`px-3.5 py-1.5 rounded-full font-medium transition ${
                status === st
                  ? 'bg-[#0066cc] text-white shadow-sm'
                  : 'bg-[#272729] text-[#a1a1a6] hover:text-white hover:bg-[#333336]'
              }`}
            >
              {st}
            </Link>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#161617] rounded-[18px] border border-[#333336] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1f1f21] text-[#86868b] border-b border-[#333336]">
              <tr>
                <th className="py-3 px-6 font-medium">Order</th>
                <th className="py-3 px-6 font-medium">Customer</th>
                <th className="py-3 px-6 font-medium">Date</th>
                <th className="py-3 px-6 font-medium">Status</th>
                <th className="py-3 px-6 font-medium">Payment</th>
                <th className="py-3 px-6 font-medium">Method</th>
                <th className="py-3 px-6 font-medium text-right">Total</th>
                <th className="py-3 px-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333336] text-[#a1a1a6]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#86868b]">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No orders found matching the criteria</p>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#1f1f21]/60 transition">
                    <td className="py-3.5 px-6 font-mono font-semibold text-white">
                      <Link href={`/admin/orders/${o.id}`} className="hover:text-[#2997ff]">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-6">
                      <p className="font-medium text-white">{o.customerName}</p>
                      <p className="text-[10px] text-[#86868b]">{o.customerEmail}</p>
                    </td>
                    <td className="py-3.5 px-6 text-[#86868b]">{formatDate(o.createdAt)}</td>
                    <td className="py-3.5 px-6">
                      <span className="px-3 py-1 rounded-full text-[10px] font-medium bg-[#272729] text-[#f5f5f7] border border-[#3e3e42]">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="px-3 py-1 rounded-full text-[10px] font-medium bg-[#0066cc]/15 text-[#2997ff] border border-[#0066cc]/30">
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-[#86868b]">{o.paymentMethod}</td>
                    <td className="py-3.5 px-6 text-right font-semibold text-white">
                      {formatPrice(o.total)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="apple-btn inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#272729] hover:bg-[#333336] text-[#2997ff] border border-[#3e3e42] text-[11px] font-medium transition"
                      >
                        <Eye className="w-3 h-3" /> Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
