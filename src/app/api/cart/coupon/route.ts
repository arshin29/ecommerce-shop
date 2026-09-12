import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/formatters';

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Please enter a coupon code.' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { success: false, message: 'Invalid or inactive coupon code.' },
        { status: 404 }
      );
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, message: 'This coupon code has expired.' },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, message: 'This coupon has reached its maximum usage limit.' },
        { status: 400 }
      );
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          success: false,
          message: `This coupon requires a minimum purchase order of ${formatPrice(coupon.minOrderAmount)}.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        value: coupon.value,
        minOrderAmount: coupon.minOrderAmount,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Coupon validation failed';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
