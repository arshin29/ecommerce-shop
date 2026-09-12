import React from 'react';
import { prisma } from '@/lib/prisma';
import { CategoriesManager } from './CategoriesManager';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Categories</h1>
        <p className="text-xs text-[#86868b] mt-1">
          Organize and structure product collections synchronized with Neon PostgreSQL.
        </p>
      </div>

      <CategoriesManager categories={categories} />
    </div>
  );
}
