import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { reviewSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { productId, authorName, authorEmail, rating, title, comment } = parsed.data;
    const user = await getCurrentUser();

    const review = await prisma.productReview.create({
      data: {
        productId,
        userId: user?.userId || null,
        authorName,
        authorEmail,
        rating,
        title,
        comment,
        isApproved: true,
      },
    });

    // Recalculate average rating & reviewCount for product
    const allReviews = await prisma.productReview.findMany({
      where: { productId, isApproved: true },
      select: { rating: true },
    });

    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit review';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
