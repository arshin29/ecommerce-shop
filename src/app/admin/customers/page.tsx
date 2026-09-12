import React from 'react';
import Link from 'next/link';
import { Users, Mail, Calendar, DollarSign, ShoppingBag, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/formatters';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
      },
      addresses: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalCustomers = customers.length;
  const totalCustomerSpend = customers.reduce((acc, c) => {
    return acc + c.orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? o.total : 0), 0);
  }, 0);
  const activeBuyers = customers.filter((c) => c.orders.length > 0).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Customers</h1>
        <p className="text-xs text-[#86868b] mt-1">
          Customer profiles, lifetime spend telemetry, order frequencies, and delivery addresses.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[#86868b]">Total Registered</span>
          <div className="text-3xl font-bold tracking-tight text-white">{totalCustomers}</div>
          <p className="text-xs text-[#2997ff] font-medium">Customer accounts in Neon DB</p>
        </div>

        <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[#86868b]">Cumulative Spend</span>
          <div className="text-3xl font-bold tracking-tight text-white">{formatPrice(totalCustomerSpend)}</div>
          <p className="text-xs text-[#2997ff] font-medium">Verified settled transactions</p>
        </div>

        <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[#86868b]">Active Purchasers</span>
          <div className="text-3xl font-bold tracking-tight text-white">{activeBuyers}</div>
          <p className="text-xs text-[#86868b]">Customers with ≥ 1 completed order</p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#161617] rounded-[18px] border border-[#333336] overflow-hidden">
        <div className="p-6 border-b border-[#333336] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Customer Directory</h3>
            <p className="text-xs text-[#86868b]">Synchronized customer records from Neon PostgreSQL</p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#272729] text-[#a1a1a6] border border-[#3e3e42]">
            {customers.length} Profiles
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1f1f21] text-[#86868b] border-b border-[#333336]">
              <tr>
                <th className="py-3 px-6 font-medium">Customer</th>
                <th className="py-3 px-6 font-medium">Email Address</th>
                <th className="py-3 px-6 font-medium">Orders Count</th>
                <th className="py-3 px-6 font-medium">Lifetime Spend</th>
                <th className="py-3 px-6 font-medium">Latest Purchase</th>
                <th className="py-3 px-6 font-medium">Status</th>
                <th className="py-3 px-6 font-medium text-right">Saved Addresses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333336] text-[#a1a1a6]">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#86868b]">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No customer accounts recorded yet.</p>
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const totalSpent = c.orders.reduce(
                    (sum, o) => sum + (o.paymentStatus === 'PAID' ? o.total : 0),
                    0
                  );
                  const lastOrder = c.orders[0];

                  return (
                    <tr key={c.id} className="hover:bg-[#1f1f21]/60 transition">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#272729] border border-[#3e3e42] text-white flex items-center justify-center font-semibold text-xs">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-white">{c.name}</p>
                            <p className="text-[10px] text-[#86868b]">Member since {formatDate(c.createdAt)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-6 text-[#a1a1a6] font-mono text-[11px]">{c.email}</td>
                      <td className="py-3.5 px-6 font-mono text-white">
                        {c.orders.length} {c.orders.length === 1 ? 'order' : 'orders'}
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-white">{formatPrice(totalSpent)}</td>
                      <td className="py-3.5 px-6 text-[#86868b]">
                        {lastOrder ? (
                          <div className="space-y-0.5">
                            <span className="text-white font-mono">{lastOrder.orderNumber}</span>
                            <p className="text-[10px]">{formatDate(lastOrder.createdAt)}</p>
                          </div>
                        ) : (
                          'No orders yet'
                        )}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="px-3 py-1 rounded-full text-[10px] font-medium bg-[#0066cc]/15 text-[#2997ff] border border-[#0066cc]/30">
                          Active
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right text-[#86868b]">
                        {c.addresses.length > 0 ? (
                          <span className="font-mono text-[11px] text-white">
                            {c.addresses.length} on file
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#86868b]">None</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
