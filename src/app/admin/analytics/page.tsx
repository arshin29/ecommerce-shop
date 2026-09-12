import React from 'react';
import { TrendingUp, ShoppingBag, DollarSign, Award, FolderTree, CreditCard } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/formatters';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const [orders, orderItems, categories] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.orderItem.findMany({
      include: {
        product: { select: { name: true, sku: true, images: true } },
      },
    }),
    prisma.category.findMany({
      include: {
        products: {
          include: { orderItems: true },
        },
      },
    }),
  ]);

  const totalSales = orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? o.total : 0), 0);
  const totalOrders = orders.length;
  const aov = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Best selling products calculation
  const productSalesMap: Record<string, { name: string; sku: string; units: number; revenue: number; image?: string }> = {};
  for (const item of orderItems) {
    if (!productSalesMap[item.productId]) {
      productSalesMap[item.productId] = {
        name: item.title,
        sku: item.sku || 'N/A',
        units: 0,
        revenue: 0,
        image: item.image || undefined,
      };
    }
    productSalesMap[item.productId].units += item.quantity;
    productSalesMap[item.productId].revenue += item.total;
  }

  const bestSellingProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Best performing categories
  const categoryPerformances = categories
    .map((cat) => {
      const revenue = cat.products.reduce((acc, p) => {
        return acc + p.orderItems.reduce((pSum, oi) => pSum + oi.total, 0);
      }, 0);
      const units = cat.products.reduce((acc, p) => {
        return acc + p.orderItems.reduce((pSum, oi) => pSum + oi.quantity, 0);
      }, 0);
      return { name: cat.name, revenue, units };
    })
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
        <p className="text-xs text-[#86868b] mt-1">
          Detailed telemetry and metrics aggregated live from Neon PostgreSQL order records.
        </p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[#86868b]">Total Store Revenue</span>
          <div className="text-3xl font-bold tracking-tight text-white">{formatPrice(totalSales)}</div>
          <p className="text-xs text-[#2997ff] font-medium">Synced with live orders</p>
        </div>

        <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[#86868b]">Lifetime Orders</span>
          <div className="text-3xl font-bold tracking-tight text-white">{totalOrders}</div>
          <p className="text-xs text-[#86868b]">Across all demo checkouts</p>
        </div>

        <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[#86868b]">Average Order Value</span>
          <div className="text-3xl font-bold tracking-tight text-white">{formatPrice(aov)}</div>
          <p className="text-xs text-[#2997ff]">Average basket expenditure</p>
        </div>
      </div>

      {/* 2-Column Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#0066cc]" />
            <h3 className="text-base font-bold text-white tracking-tight">Top Products by Revenue</h3>
          </div>

          <div className="space-y-4">
            {bestSellingProducts.length === 0 ? (
              <p className="text-xs text-[#86868b]">No sales data recorded yet.</p>
            ) : (
              bestSellingProducts.map((p, idx) => (
                <div key={p.name} className="flex items-center justify-between text-xs pb-3 border-b border-[#333336] last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center font-bold text-[#86868b]">{idx + 1}</span>
                    <div className="w-10 h-10 rounded-[10px] bg-[#272729] overflow-hidden flex-shrink-0 border border-[#3e3e42] p-1 flex items-center justify-center">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#86868b]">📦</div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white line-clamp-1">{p.name}</p>
                      <p className="text-[11px] text-[#86868b]">{p.units} units sold</p>
                    </div>
                  </div>
                  <span className="font-semibold text-white">{formatPrice(p.revenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Categories Performance */}
        <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-6">
          <div className="flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-[#0066cc]" />
            <h3 className="text-base font-bold text-white tracking-tight">Category Breakdown</h3>
          </div>

          <div className="space-y-4">
            {categoryPerformances.map((c) => (
              <div key={c.name} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-white">{c.name}</span>
                  <span className="text-[#86868b]">{formatPrice(c.revenue)} ({c.units} units)</span>
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
    </div>
  );
}
