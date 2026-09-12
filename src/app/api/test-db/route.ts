import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        variants: true,
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Next.js → Prisma → Neon PostgreSQL connection verified successfully!',
      database: 'Neon PostgreSQL',
      totalProducts: products.length,
      products,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to connect to Neon PostgreSQL database.',
        error: message,
      },
      { status: 500 }
    );
  }
}
