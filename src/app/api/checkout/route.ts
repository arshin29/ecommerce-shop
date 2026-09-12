import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { checkoutSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, ...customerData } = body;

    // 1. Validate Form fields
    const parsed = checkoutSchema.safeParse(customerData);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Your cart is empty.' },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      paymentMethod,
      couponCode,
    } = parsed.data;

    const currentUser = await getCurrentUser();

    // 2. Validate Items & Check Stock in Neon DB
    let subtotal = 0;
    const validatedItems: Array<{
      productId: string;
      variantId?: string;
      title: string;
      variantTitle?: string;
      sku: string;
      price: number;
      quantity: number;
      total: number;
      image?: string;
    }> = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true, images: true },
      });

      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product not found: ${item.title}` },
          { status: 400 }
        );
      }

      let price = product.price;
      let sku = product.sku;
      let variantTitle = 'Standard';

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) {
          return NextResponse.json(
            { success: false, error: `Variant not found for ${product.name}` },
            { status: 400 }
          );
        }

        if (variant.stock < item.quantity) {
          return NextResponse.json(
            {
              success: false,
              error: `Insufficient stock for ${product.name} (${variant.title}). Available: ${variant.stock}, Requested: ${item.quantity}`,
            },
            { status: 400 }
          );
        }

        price = variant.price;
        sku = variant.sku;
        variantTitle = variant.title;
      }

      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: product.id,
        variantId: item.variantId || undefined,
        title: product.name,
        variantTitle,
        sku,
        price,
        quantity: item.quantity,
        total: itemTotal,
        image: product.images[0]?.url || item.image,
      });
    }

    // 3. Discount Calculation
    let discount = 0;
    let validCouponId: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
          validCouponId = coupon.id;
          if (coupon.discountType === 'PERCENTAGE') {
            discount = (subtotal * coupon.value) / 100;
          } else {
            discount = Math.min(coupon.value, subtotal);
          }
        }
      }
    }

    // Free shipping threshold
    const thresholdSetting = await prisma.storeSetting.findUnique({ where: { key: 'FREE_SHIPPING_THRESHOLD' } });
    const feeSetting = await prisma.storeSetting.findUnique({ where: { key: 'DEFAULT_SHIPPING_FEE' } });
    const freeShippingThreshold = thresholdSetting ? parseFloat(thresholdSetting.value) : 999;
    const defaultShippingFee = feeSetting ? parseFloat(feeSetting.value) : 99;

    const shipping = subtotal >= freeShippingThreshold ? 0 : defaultShippingFee;
    const finalTotal = Math.max(0, subtotal - discount + shipping);

    // 4. Generate unique order number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-2026-${randomSuffix}`;

    // 5. Create Address in Neon
    const address = await prisma.address.create({
      data: {
        userId: currentUser?.userId || null,
        fullName: customerName,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        phone: customerPhone,
      },
    });

    // 6. Create Order in Neon
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: currentUser?.userId || null,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddressId: address.id,
        subtotal,
        discount,
        shipping,
        total: finalTotal,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentMethod: paymentMethod as 'DEMO_CARD' | 'DEMO_UPI' | 'CASH_ON_DELIVERY',
      },
    });

    // 7. Create OrderItems & Decrement Inventory Stock in Neon
    for (const vItem of validatedItems) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: vItem.productId,
          variantId: vItem.variantId,
          title: vItem.title,
          variantTitle: vItem.variantTitle,
          sku: vItem.sku,
          price: vItem.price,
          quantity: vItem.quantity,
          total: vItem.total,
          image: vItem.image,
        },
      });

      // Decrement variant stock
      if (vItem.variantId) {
        await prisma.productVariant.update({
          where: { id: vItem.variantId },
          data: { stock: { decrement: vItem.quantity } },
        });

        // Update inventory table if present
        const inv = await prisma.inventory.findFirst({
          where: { variantId: vItem.variantId },
        });
        if (inv) {
          await prisma.inventory.update({
            where: { id: inv.id },
            data: { quantity: { decrement: vItem.quantity } },
          });
        }
      }
    }

    // 8. Increment Coupon usage
    if (validCouponId) {
      await prisma.coupon.update({
        where: { id: validCouponId },
        data: { usageCount: { increment: 1 } },
      });
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      message: 'Order created successfully with demo payment verification.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Checkout processing failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
