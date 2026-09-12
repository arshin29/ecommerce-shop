import { z } from 'zod';

export const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Full name must be at least 2 characters'),
  customerEmail: z.string().email('Please provide a valid email address'),
  customerPhone: z.string().min(7, 'Please provide a valid phone number'),
  addressLine1: z.string().min(3, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State or Province is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  paymentMethod: z.enum(['DEMO_CARD', 'DEMO_UPI', 'CASH_ON_DELIVERY']),
  couponCode: z.string().optional(),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
  upiId: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  compareAtPrice: z.number().positive('Compare at price must be positive').optional().nullable(),
  sku: z.string().min(2, 'SKU is required'),
  categoryId: z.string().min(1, 'Category is required'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
  featured: z.boolean().default(false),
  stock: z.number().int().nonnegative().default(10),
  tags: z.string().optional(),
  imageUrl: z.string().url('Must be a valid image URL').optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const couponSchema = z.object({
  code: z.string().min(3, 'Coupon code must be at least 3 characters').toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().positive('Value must be positive'),
  minOrderAmount: z.number().nonnegative().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type CouponFormData = z.infer<typeof couponSchema>;

export const reviewSchema = z.object({
  productId: z.string().min(1),
  authorName: z.string().min(2, 'Your name is required'),
  authorEmail: z.string().email('Valid email is required'),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(5, 'Review must be at least 5 characters'),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
