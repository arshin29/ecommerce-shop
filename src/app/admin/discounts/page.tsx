import React from 'react';
import { prisma } from '@/lib/prisma';
import { DiscountsManager } from './DiscountsManager';

export const dynamic = 'force-dynamic';

export default async function AdminDiscountsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Discounts</h1>
        <p className="text-xs text-[#86868b] mt-1">
          Create percentage or fixed promotional codes to incentivize customer checkouts.
        </p>
      </div>

      <DiscountsManager coupons={coupons} />
    </div>
  );
}
