import React from 'react';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, Eye, Star } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/formatters';
import { AdminProductRow } from './AdminProductRow';

export const dynamic = 'force-dynamic';

interface AdminProductsProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    status?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsProps) {
  const params = await searchParams;
  const { search, category, status } = params;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (category) where.categoryId = category;
  if (status) where.status = status;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: true,
        variants: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Products</h1>
          <p className="text-xs text-[#86868b] mt-1">
            Manage specifications, variants, pricing, and live inventory records in Neon.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="apple-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white text-xs font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#161617] p-4 rounded-[18px] border border-[#333336] flex flex-col sm:flex-row gap-3">
        <form action="/admin/products" method="GET" className="flex-1 relative">
          <input
            type="text"
            name="search"
            defaultValue={search || ''}
            placeholder="Search by product title or SKU..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-full text-white placeholder:text-[#86868b] focus:outline-none focus:border-[#0066cc]"
          />
          <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </form>

        <div className="flex gap-2">
          <Link
            href="/admin/products"
            className="apple-btn px-4 py-2 rounded-full text-xs font-medium bg-[#272729] text-[#a1a1a6] hover:text-white border border-[#3e3e42] transition"
          >
            Reset
          </Link>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#161617] rounded-[18px] border border-[#333336] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1f1f21] text-[#86868b] border-b border-[#333336]">
              <tr>
                <th className="py-3 px-6 font-medium">Product</th>
                <th className="py-3 px-6 font-medium">Category</th>
                <th className="py-3 px-6 font-medium">Price</th>
                <th className="py-3 px-6 font-medium">Stock</th>
                <th className="py-3 px-6 font-medium">Status</th>
                <th className="py-3 px-6 font-medium">Rating</th>
                <th className="py-3 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333336] text-[#a1a1a6]">
              {products.map((p) => {
                const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
                return (
                  <AdminProductRow
                    key={p.id}
                    product={{
                      id: p.id,
                      name: p.name,
                      slug: p.slug,
                      sku: p.sku,
                      price: p.price,
                      categoryName: p.category.name,
                      status: p.status,
                      featured: p.featured,
                      rating: p.rating,
                      totalStock,
                      imageUrl: p.images[0]?.url,
                    }}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
