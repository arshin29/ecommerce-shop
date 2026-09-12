import React from 'react';
import { prisma } from '@/lib/prisma';
import { InventoryTable } from './InventoryTable';

export const dynamic = 'force-dynamic';

export default async function AdminInventoryPage() {
  const variants = await prisma.productVariant.findMany({
    include: {
      product: {
        include: {
          images: true,
          category: true,
        },
      },
    },
    orderBy: { stock: 'asc' },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Inventory</h1>
        <p className="text-xs text-[#86868b] mt-1">
          Monitor product variation quantities, low-stock thresholds, and adjust inventory live in Neon.
        </p>
      </div>

      <InventoryTable variants={variants} />
    </div>
  );
}
