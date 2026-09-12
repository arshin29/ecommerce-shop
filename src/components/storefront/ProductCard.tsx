'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Check, Heart } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    rating: number;
    reviewCount: number;
    featured?: boolean;
    images?: Array<{ url: string; alt?: string | null; isPrimary?: boolean }>;
    variants?: Array<{ id: string; title: string; price: number; stock: number; sku: string }>;
    category?: { name: string; slug: string };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

  const defaultVariant = product.variants?.[0];
  const stock = defaultVariant?.stock ?? 10;
  const isOutOfStock = stock <= 0;

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      variantId: defaultVariant?.id,
      title: product.name,
      variantTitle: defaultVariant?.title,
      price: defaultVariant?.price ?? product.price,
      image: primaryImage,
      quantity: 1,
      stock,
      sku: defaultVariant?.sku,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-[18px] border border-[#e5e5e7] hover:border-[#d2d2d7] transition-all duration-300 p-5 overflow-hidden">
      {/* Product Image Stage */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative aspect-square w-full rounded-[12px] bg-[#f5f5f7] overflow-hidden mb-4"
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
          loading="lazy"
        />

        {/* Minimal Apple Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.featured && (
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-[#1d1d1f] text-white">
              Featured
            </span>
          )}
          {hasDiscount && (
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-[#e30000] text-white">
              Special Offer
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-[#86868b] text-white">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition backdrop-blur-md shadow-2xs ${
            inWishlist
              ? 'bg-white text-[#e03e3e]'
              : 'bg-white/80 text-[#86868b] hover:text-[#e03e3e] hover:bg-white'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
          title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 transition ${inWishlist ? 'fill-current scale-110 text-[#e03e3e]' : ''}`} />
        </button>
      </Link>

      {/* Content Details */}
      <div className="flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category */}
          {product.category && (
            <p className="text-[11px] font-medium tracking-wide uppercase text-[#b64400] mb-1">
              {product.category.name}
            </p>
          )}

          {/* Title */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-[17px] font-semibold text-[#1d1d1f] leading-snug group-hover:text-[#0066cc] transition line-clamp-1 tracking-tight">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center text-[#f5a623]">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-[12px] font-medium text-[#1d1d1f]">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-[12px] text-[#86868b]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Pricing & Apple Action Pill */}
        <div className="pt-3 border-t border-[#f5f5f7] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-[17px] font-semibold text-[#1d1d1f]">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-[13px] text-[#86868b] line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`apple-btn px-4 py-1.5 rounded-full text-[12px] font-medium transition ${
              added
                ? 'bg-[#34c759] text-white'
                : isOutOfStock
                ? 'bg-[#f5f5f7] text-[#86868b] cursor-not-allowed'
                : 'bg-[#0066cc] hover:bg-[#0071e3] text-white shadow-xs'
            }`}
          >
            {added ? (
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3" /> Added
              </span>
            ) : isOutOfStock ? (
              'Sold Out'
            ) : (
              'Add to Bag'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
