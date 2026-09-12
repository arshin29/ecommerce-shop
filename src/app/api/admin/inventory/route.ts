import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { variantId, stock } = await req.json();

    if (!variantId || typeof stock !== 'number') {
      return NextResponse.json({ success: false, error: 'Invalid variant ID or stock value' }, { status: 400 });
    }

    const updated = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: Math.max(0, stock) },
    });

    const inv = await prisma.inventory.findFirst({ where: { variantId } });
    if (inv) {
      await prisma.inventory.update({
        where: { id: inv.id },
        data: { quantity: Math.max(0, stock) },
      });
    }

    return NextResponse.json({ success: true, variant: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update stock';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
