'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, ExternalLink, Star } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';

interface AdminProductRowProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    categoryName: string;
    status: string;
    featured: boolean;
    rating: number;
    totalStock: number;
    imageUrl?: string;
  };
}

export function AdminProductRow({ product }: AdminProductRowProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products?id=${product.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      alert('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <tr className="hover:bg-[#1f1f21]/60 transition">
      <td className="py-3 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#272729] overflow-hidden flex-shrink-0 border border-[#3e3e42] p-1 flex items-center justify-center">
            {product.imageUrl && (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white line-clamp-1">{product.name}</span>
              {product.featured && (
                <span className="px-2 py-0.2 rounded-full text-[9px] font-medium bg-[#ff9f0a]/15 text-[#ff9f0a] border border-[#ff9f0a]/30">
                  Featured
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#86868b] font-mono">SKU: {product.sku}</span>
          </div>
        </div>
      </td>

      <td className="py-3 px-6 text-[#86868b]">{product.categoryName}</td>
      <td className="py-3 px-6 font-semibold text-white">{formatPrice(product.price)}</td>

      <td className="py-3 px-6">
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-medium ${
            product.totalStock <= 0
              ? 'bg-[#e03e3e]/15 text-[#e03e3e] border border-[#e03e3e]/30'
              : product.totalStock <= 5
              ? 'bg-[#ff9f0a]/15 text-[#ff9f0a] border border-[#ff9f0a]/30'
              : 'bg-[#272729] text-[#f5f5f7] border border-[#3e3e42]'
          }`}
        >
          {product.totalStock} in stock
        </span>
      </td>

      <td className="py-3 px-6">
        <span className="px-3 py-1 rounded-full text-[10px] font-medium bg-[#0066cc]/15 text-[#2997ff] border border-[#0066cc]/30">
          {product.status}
        </span>
      </td>

      <td className="py-3 px-6">
        <div className="flex items-center gap-1 text-[#ff9f0a]">
          <Star className="w-3 h-3 fill-current" />
          <span className="text-white font-medium">{product.rating.toFixed(1)}</span>
        </div>
      </td>

      <td className="py-3 px-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="p-1.5 rounded-full hover:bg-[#272729] text-[#86868b] hover:text-white transition"
            title="View in Storefront"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/admin/products/${product.id}`}
            className="p-1.5 rounded-full hover:bg-[#272729] text-[#86868b] hover:text-white transition"
            title="Edit Product"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-full hover:bg-[#272729] text-[#86868b] hover:text-[#e03e3e] transition disabled:opacity-50"
            title="Delete Product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
