'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Tag, Percent, DollarSign } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';

interface CouponItem {
  id: string;
  code: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
}

export function DiscountsManager({ coupons }: { coupons: CouponItem[] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [value, setValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number | ''>(20);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          description,
          discountType,
          value,
          minOrderAmount: minOrderAmount === '' ? null : Number(minOrderAmount),
          isActive: true,
        }),
      });

      if (res.ok) {
        setCode('');
        setDescription('');
        setValue(10);
        setShowModal(false);
        router.refresh();
      }
    } catch {
      alert('Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon code "${code}"?`)) return;
    try {
      await fetch(`/api/admin/discounts?id=${id}`, { method: 'DELETE' });
      router.refresh();
    } catch {
      alert('Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="apple-btn px-5 py-2.5 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="bg-[#161617] rounded-[18px] border border-[#333336] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1f1f21] text-[#86868b] border-b border-[#333336]">
              <tr>
                <th className="py-3 px-6 font-medium">Code</th>
                <th className="py-3 px-6 font-medium">Description</th>
                <th className="py-3 px-6 font-medium">Discount</th>
                <th className="py-3 px-6 font-medium">Min Order</th>
                <th className="py-3 px-6 font-medium">Usage</th>
                <th className="py-3 px-6 font-medium">Status</th>
                <th className="py-3 px-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333336] text-[#a1a1a6]">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#86868b]">
                    No promotional coupons configured yet.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#1f1f21]/60 transition">
                    <td className="py-3.5 px-6 font-mono font-bold text-white flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#0066cc]" />
                      <span>{c.code}</span>
                    </td>
                    <td className="py-3.5 px-6 text-[#86868b]">{c.description || '—'}</td>
                    <td className="py-3.5 px-6 font-medium text-white">
                      {c.discountType === 'PERCENTAGE' ? `${c.value}% OFF` : `${formatPrice(c.value)} OFF`}
                    </td>
                    <td className="py-3.5 px-6 text-[#86868b]">
                      {c.minOrderAmount ? formatPrice(c.minOrderAmount) : 'None'}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-white">{c.usageCount} orders</td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-medium ${
                          c.isActive
                            ? 'bg-[#0066cc]/15 text-[#2997ff] border border-[#0066cc]/30'
                            : 'bg-[#272729] text-[#86868b] border border-[#3e3e42]'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleDelete(c.id, c.code)}
                        className="p-1.5 rounded-full hover:bg-[#272729] text-[#86868b] hover:text-[#e03e3e] transition"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#161617] border border-[#333336] rounded-[18px] p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white tracking-tight">Create Coupon Code</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#86868b] font-medium mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="SUMMER25"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-[12px] bg-[#272729] border border-[#3e3e42] text-white font-mono uppercase focus:outline-none focus:border-[#0066cc]"
                />
              </div>

              <div>
                <label className="block text-[#86868b] font-medium mb-1">Description</label>
                <input
                  type="text"
                  placeholder="25% off summer collection"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-[12px] bg-[#272729] border border-[#3e3e42] text-white focus:outline-none focus:border-[#0066cc]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#86868b] font-medium mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-[12px] bg-[#272729] border border-[#3e3e42] text-white focus:outline-none focus:border-[#0066cc]"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#86868b] font-medium mb-1">Discount Value</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={value}
                    onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-[12px] bg-[#272729] border border-[#3e3e42] text-white font-mono focus:outline-none focus:border-[#0066cc]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#86868b] font-medium mb-1">Minimum Order Subtotal ($)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Leave empty for no minimum"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-[12px] bg-[#272729] border border-[#3e3e42] text-white font-mono focus:outline-none focus:border-[#0066cc]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="apple-btn px-4 py-2 rounded-full text-xs font-medium text-[#86868b] hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="apple-btn px-5 py-2 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white text-xs font-medium transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
