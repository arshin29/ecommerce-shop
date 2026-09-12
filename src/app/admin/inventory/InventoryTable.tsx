'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Save, AlertTriangle, Check } from 'lucide-react';

interface VariantItem {
  id: string;
  title: string;
  sku: string;
  price: number;
  stock: number;
  product: {
    id: string;
    name: string;
    category: { name: string };
    images: Array<{ url: string }>;
  };
}

export function InventoryTable({ variants }: { variants: VariantItem[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [stocks, setStocks] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    variants.forEach((v) => {
      init[v.id] = v.stock;
    });
    return init;
  });
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleStockChange = (variantId: string, val: number) => {
    setStocks((prev) => ({ ...prev, [variantId]: val }));
  };

  const handleSaveStock = async (variantId: string) => {
    setSavingId(variantId);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, stock: stocks[variantId] }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      alert('Failed to update stock');
    } finally {
      setSavingId(null);
    }
  };

  const filtered = variants.filter((v) => {
    const matchesSearch =
      v.product.name.toLowerCase().includes(search.toLowerCase()) ||
      v.sku.toLowerCase().includes(search.toLowerCase()) ||
      v.title.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    const currentStock = stocks[v.id] ?? v.stock;
    if (filter === 'OUT_OF_STOCK') return currentStock <= 0;
    if (filter === 'LOW_STOCK') return currentStock > 0 && currentStock <= 5;
    if (filter === 'IN_STOCK') return currentStock > 5;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-[#161617] p-4 rounded-[18px] border border-[#333336] flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Filter by product, SKU, variant title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-full text-white placeholder:text-[#86868b] focus:outline-none focus:border-[#0066cc]"
          />
          <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { id: 'ALL', label: 'All Items' },
            { id: 'IN_STOCK', label: 'In Stock (>5)' },
            { id: 'LOW_STOCK', label: 'Low Stock (≤5)' },
            { id: 'OUT_OF_STOCK', label: 'Out of Stock (0)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full font-medium transition ${
                filter === tab.id
                  ? 'bg-[#0066cc] text-white shadow-sm'
                  : 'bg-[#272729] text-[#a1a1a6] hover:text-white hover:bg-[#333336]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Items List */}
      <div className="bg-[#161617] rounded-[18px] border border-[#333336] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1f1f21] text-[#86868b] border-b border-[#333336]">
              <tr>
                <th className="py-3 px-6 font-medium">Product / Variant</th>
                <th className="py-3 px-6 font-medium">SKU</th>
                <th className="py-3 px-6 font-medium">Category</th>
                <th className="py-3 px-6 font-medium">Stock Status</th>
                <th className="py-3 px-6 font-medium">Adjust Quantity</th>
                <th className="py-3 px-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333336] text-[#a1a1a6]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#86868b]">
                    No variants matched your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => {
                  const currentStock = stocks[v.id] ?? v.stock;
                  const isDirty = currentStock !== v.stock;
                  return (
                    <tr key={v.id} className="hover:bg-[#1f1f21]/60 transition">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[10px] bg-[#272729] overflow-hidden flex-shrink-0 border border-[#3e3e42] p-1 flex items-center justify-center">
                            {v.product.images[0] ? (
                              <img
                                src={v.product.images[0].url}
                                alt={v.product.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#272729] flex items-center justify-center text-xs text-[#86868b]">
                                📦
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white">{v.product.name}</p>
                            <p className="text-[11px] text-[#86868b]">{v.title}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-6 font-mono text-[11px] text-[#86868b]">{v.sku}</td>
                      <td className="py-3.5 px-6 text-[#86868b]">{v.product.category.name}</td>

                      <td className="py-3.5 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-medium ${
                            currentStock <= 0
                              ? 'bg-[#e03e3e]/15 text-[#e03e3e] border border-[#e03e3e]/30'
                              : currentStock <= 5
                              ? 'bg-[#ff9f0a]/15 text-[#ff9f0a] border border-[#ff9f0a]/30'
                              : 'bg-[#272729] text-[#f5f5f7] border border-[#3e3e42]'
                          }`}
                        >
                          {currentStock <= 0
                            ? 'Out of Stock'
                            : currentStock <= 5
                            ? `Low (${currentStock} left)`
                            : `Healthy (${currentStock} units)`}
                        </span>
                      </td>

                      <td className="py-3.5 px-6">
                        <input
                          type="number"
                          min="0"
                          value={currentStock}
                          onChange={(e) => handleStockChange(v.id, parseInt(e.target.value) || 0)}
                          className={`w-24 px-3 py-1.5 text-xs bg-[#272729] rounded-full text-white font-mono focus:outline-none transition ${
                            isDirty
                              ? 'border border-[#2997ff] text-[#2997ff] ring-1 ring-[#2997ff]/30'
                              : 'border border-[#3e3e42]'
                          }`}
                        />
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleSaveStock(v.id)}
                          disabled={!isDirty || savingId === v.id}
                          className="apple-btn inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white text-xs font-medium transition disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{savingId === v.id ? 'Syncing...' : 'Save'}</span>
                        </button>
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
