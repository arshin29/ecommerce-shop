import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { productSchema } from '@/lib/validations';
import { slugify } from '@/lib/formatters';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: true,
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, products });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      compareAtPrice,
      sku,
      categoryId,
      status,
      featured,
      stock,
      tags,
      imageUrl,
    } = parsed.data;

    const formattedSlug = slugify(slug || name);

    // Check slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug: formattedSlug } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A product with this slug already exists.' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: formattedSlug,
        description,
        shortDescription,
        price,
        compareAtPrice: compareAtPrice || null,
        sku,
        categoryId,
        status: status as any,
        featured,
        tags: tags || '[]',
      },
    });

    // Create Primary Image if provided
    if (imageUrl) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: imageUrl,
          alt: name,
          isPrimary: true,
          position: 0,
        },
      });
    }

    // Create default variant & inventory
    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        title: 'Standard',
        sku,
        price,
        compareAtPrice: compareAtPrice || null,
        stock,
      },
    });

    await prisma.inventory.create({
      data: {
        productId: product.id,
        variantId: variant.id,
        sku,
        quantity: stock,
        lowStockThreshold: 5,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription,
        price: Number(data.price),
        compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : null,
        sku: data.sku,
        categoryId: data.categoryId,
        status: data.status,
        featured: Boolean(data.featured),
        tags: typeof data.tags === 'string' ? data.tags : JSON.stringify(data.tags || []),
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
