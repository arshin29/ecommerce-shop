import React from 'react';
import { prisma } from '@/lib/prisma';
import { ProductForm } from '../ProductForm';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Create Product</h1>
        <p className="text-xs text-[#86868b] mt-1">
          Add an item to your store catalog. Synchronized directly with Neon PostgreSQL.
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
