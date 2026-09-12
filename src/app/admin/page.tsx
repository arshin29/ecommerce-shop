import React from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/formatters';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // Fetch real analytics from Neon DB
  const [
    orders,
    products,
    customers,
    lowStockVariants,
    categories,
  ] = await Promise.all([
    prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      include: { variants: true, category: true },
    }),
    prisma.user.findMany({
      where: { role: 'CUSTOMER' },
    }),
    prisma.productVariant.findMany({
      where: { stock: { lte: 5 } },
      include: { product: true },
    }),
    prisma.category.findMany({
      include: {
        products: {
          include: { orderItems: true },
        },
      },
    }),
  ]);

  const totalSales = orders.reduce((acc, o) => acc + (o.paymentStatus === 'PAID' ? o.total : 0), 0);
  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const totalProductsCount = products.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Category revenue calculation
  const categoryStats = categories.map((cat) => {
    const revenue = cat.products.reduce((sum, p) => {
      return sum + p.orderItems.reduce((pSum, oi) => pSum + oi.total, 0);
    }, 0);
    return { name: cat.name, revenue, count: cat.products.length };
  }).sort((a, b) => b.revenue - a.revenue);

  // Recent 6 orders
  const recentOrders = orders.slice(0, 6);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-xs text-[#86868b] mt-1">
            Real-time telemetry and order stream synchronized with Neon PostgreSQL.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link
            href="/admin/products/new"
            className="apple-btn px-5 py-2.5 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white text-xs font-medium transition shadow-sm flex items-center gap-1.5"
          >
            <span>+ Add Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#86868b] uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 rounded-full bg-[#0066cc]/15 text-[#2997ff]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-white">{formatPrice(totalSales)}</div>
            <p className="text-[11px] text-[#2997ff] flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> Live Neon DB Telemetry
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#86868b] uppercase tracking-wider">Orders Placed</span>
            <div className="p-2 rounded-full bg-[#272729] text-[#f5f5f7]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-white">{totalOrders}</div>
            <p className="text-[11px] text-[#86868b] mt-1">
              AOV: <strong className="text-white font-medium">{formatPrice(averageOrderValue)}</strong>
            </p>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#86868b] uppercase tracking-wider">Customers</span>
            <div className="p-2 rounded-full bg-[#272729] text-[#f5f5f7]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-white">{totalCustomers}</div>
            <p className="text-[11px] text-[#86868b] mt-1">Active customer profiles</p>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#86868b] uppercase tracking-wider">Stock Alerts</span>
            <div className="p-2 rounded-full bg-[#ff9f0a]/15 text-[#ff9f0a]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-white">{lowStockVariants.length}</div>
            <p className="text-[11px] text-[#ff9f0a] mt-1 font-medium">
              Variants with ≤ 5 units left
            </p>
          </div>
        </div>
      </div>

      {/* Financial Activity & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Bar Chart */}
        <div className="lg:col-span-2 bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Order Activity</h3>
              <p className="text-xs text-[#86868b]">Revenue volume by completed purchases</p>
            </div>
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#272729] text-[#a1a1a6] border border-[#3e3e42]">
              Live Stream
            </span>
          </div>

          {/* Apple-style clean minimal bar visualization */}
          <div className="h-44 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-[#333336]">
            {orders.slice(0, 10).map((o) => {
              const maxOrderTotal = Math.max(...orders.map((ord) => ord.total), 1000);
              const heightPercent = Math.min(100, Math.max(18, (o.total / maxOrderTotal) * 100));
              return (
                <div key={o.id} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div
                    className="w-full rounded-full bg-[#0066cc] group-hover:bg-[#2997ff] transition-all duration-300"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[10px] font-mono text-[#86868b] truncate max-w-[36px]">
                    #{o.orderNumber.split('-')[2]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-xs text-[#86868b]">
            <span>Recent Orders stream</span>
            <span>Normalized to highest recent order</span>
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-4">
          <h3 className="text-base font-bold text-white tracking-tight">Revenue by Category</h3>
          <div className="space-y-3.5">
            {categoryStats.map((c) => (
              <div key={c.name} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#a1a1a6] font-medium">{c.name}</span>
                  <span className="text-white font-semibold">{formatPrice(c.revenue)}</span>
                </div>
                <div className="w-full h-1.5 bg-[#272729] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0066cc] rounded-full"
                    style={{
                      width: `${totalSales > 0 ? (c.revenue / totalSales) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Feed */}
      <div className="bg-[#161617] rounded-[18px] border border-[#333336] overflow-hidden">
        <div className="p-6 border-b border-[#333336] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Recent Orders</h3>
            <p className="text-xs text-[#86868b]">Live feed of transactions synced to Neon PostgreSQL</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs text-[#2997ff] hover:underline font-medium flex items-center gap-1"
          >
            View All ({orders.length}) <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1f1f21] text-[#86868b] border-b border-[#333336]">
              <tr>
                <th className="py-3 px-6 font-medium">Order</th>
                <th className="py-3 px-6 font-medium">Customer</th>
                <th className="py-3 px-6 font-medium">Date</th>
                <th className="py-3 px-6 font-medium">Status</th>
                <th className="py-3 px-6 font-medium">Payment</th>
                <th className="py-3 px-6 font-medium">Items</th>
                <th className="py-3 px-6 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333336] text-[#a1a1a6]">
              {recentOrders.map((o) => (
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
                  <td className="py-3.5 px-6 text-[#86868b]">{o.items.length} items</td>
                  <td className="py-3.5 px-6 text-right font-bold text-white">
                    {formatPrice(o.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
