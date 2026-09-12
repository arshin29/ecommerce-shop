import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/wishlist - Fetch current user's wishlist from Neon DB
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: true, items: [] });
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: user.userId },
      include: {
        product: {
          include: {
            images: { orderBy: { position: 'asc' } },
            category: true,
            variants: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = wishlistItems.map((w) => ({
      id: w.product.id,
      name: w.product.name,
      slug: w.product.slug,
      price: w.product.price,
      compareAtPrice: w.product.compareAtPrice,
      rating: w.product.rating,
      reviewCount: w.product.reviewCount,
      featured: w.product.featured,
      images: w.product.images,
      category: w.product.category,
      variants: w.product.variants,
      addedAt: w.createdAt,
    }));

    return NextResponse.json({ success: true, items });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch wishlist';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/wishlist - Toggle product in user's wishlist
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    // Verify product exists in Neon DB
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: { orderBy: { position: 'asc' } },
        category: true,
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // If logged in, sync with Neon DB
    if (user) {
      const existing = await prisma.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId: user.userId,
            productId,
          },
        },
      });

      if (existing) {
        await prisma.wishlistItem.delete({
          where: { id: existing.id },
        });
        return NextResponse.json({ success: true, action: 'removed', product });
      } else {
        await prisma.wishlistItem.create({
          data: {
            userId: user.userId,
            productId,
          },
        });
        return NextResponse.json({ success: true, action: 'added', product });
      }
    }

    // Guest response
    return NextResponse.json({ success: true, action: 'guest', product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update wishlist';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/wishlist?productId=xyz - Remove item from wishlist
export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    if (user) {
      await prisma.wishlistItem.deleteMany({
        where: {
          userId: user.userId,
          productId,
        },
      });
    }

    return NextResponse.json({ success: true, action: 'removed' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete wishlist item';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
