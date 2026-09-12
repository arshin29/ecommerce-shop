import React from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/storefront/ProductCard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [categories, featuredProducts, newArrivals, heroProduct] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.product.findMany({
      where: { featured: true, status: 'PUBLISHED' },
      take: 6,
      include: {
        images: true,
        variants: true,
        category: { select: { name: true, slug: true } },
      },
      orderBy: { rating: 'desc' },
    }),
    prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      take: 4,
      include: {
        images: true,
        variants: true,
        category: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findFirst({
      where: { slug: 'apex-studio-wireless-anc-headphones' },
      include: { images: true, category: true },
    }),
  ]);

  return (
    <div className="w-full">
      {/* 1. Apple Hero Product Tile (Full-bleed Dark Tile #161617) */}
      <section className="relative w-full bg-[#161617] text-white pt-20 pb-24 text-center overflow-hidden border-b border-black">
        <div className="max-w-[1024px] mx-auto px-4 space-y-6">
          <div className="space-y-3">
            <span className="text-[12px] font-semibold tracking-wide uppercase text-[#2997ff]">
              Full-Stack Ecommerce
            </span>
            <h1 className="text-[42px] sm:text-[54px] lg:text-[62px] font-semibold tracking-[-0.03em] leading-[1.08] text-white">
              Nexa — Full-Stack Ecommerce Platform
            </h1>
            <p className="text-[19px] sm:text-[22px] font-normal text-[#a1a1a6] tracking-tight max-w-2xl mx-auto leading-snug">
              A Shopify-inspired storefront + admin dashboard built with Next.js and Neon PostgreSQL.
            </p>
          </div>

          {/* Apple Twin Action Pills */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              href="/products"
              className="apple-btn px-6 py-2.5 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white text-[14px] font-medium transition"
            >
              Explore Products
            </Link>
            <Link
              href="/admin"
              className="apple-btn px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#2997ff] text-[14px] font-medium transition border border-[#2997ff]/30"
            >
              Admin Dashboard
            </Link>
          </div>

          {/* Hero Product Render with signature soft product-shadow */}
          {heroProduct && (
            <div className="pt-10 max-w-3xl mx-auto">
              <Link href={`/products/${heroProduct.slug}`} className="block group">
                <div className="relative aspect-[16/9] max-w-2xl mx-auto rounded-3xl overflow-hidden bg-gradient-to-b from-[#212124] to-[#161617] p-8 flex items-center justify-center shadow-[rgba(0,0,0,0.45)_0px_25px_50px_-12px]">
                  <img
                    src={heroProduct.images[0]?.url}
                    alt={heroProduct.name}
                    className="max-h-[340px] w-auto object-contain group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
                <p className="text-[14px] text-[#2997ff] mt-4 font-medium flex items-center justify-center gap-1 group-hover:underline">
                  View {heroProduct.name} <ChevronRight className="w-4 h-4" />
                </p>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 2. Apple Categories Tile (Full-bleed Parchment #f5f5f7) */}
      <section className="w-full bg-[#f5f5f7] py-16 sm:py-20 border-b border-[#e5e5e7]">
        <div className="max-w-[1024px] mx-auto px-4">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-[34px] sm:text-[40px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
              Shop by Category.
            </h2>
            <p className="text-[17px] text-[#86868b]">
              Browse collections engineered for creative professionals.
            </p>
          </div>

          {/* Apple Minimal Category Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center bg-white rounded-[18px] border border-[#e5e5e7] hover:border-[#d2d2d7] p-4 text-center transition"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#f5f5f7] mb-3 flex items-center justify-center">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#e5e5e7]" />
                  )}
                </div>
                <span className="text-[13px] font-semibold text-[#1d1d1f] group-hover:text-[#0066cc] transition leading-tight line-clamp-1">
                  {cat.name}
                </span>
                <span className="text-[11px] text-[#86868b] mt-0.5">
                  {cat._count.products} models
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Apple Featured Showcase (Pure White Canvas #ffffff) */}
      <section className="w-full bg-[#ffffff] py-20 border-b border-[#e5e5e7]">
        <div className="max-w-[1024px] mx-auto px-4 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[#b64400]">
                Curated Hardware
              </span>
              <h2 className="text-[34px] sm:text-[40px] font-semibold tracking-[-0.02em] text-[#1d1d1f] mt-1">
                Featured Essentials.
              </h2>
            </div>
            <Link
              href="/products?featured=true"
              className="text-[14px] text-[#0066cc] font-medium hover:underline flex items-center gap-1"
            >
              Browse all featured <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Apple Environment / Craft Tile (Near-Black Tile #272729) */}
      <section className="w-full bg-[#272729] text-white py-20 sm:py-24 text-center border-b border-black">
        <div className="max-w-[800px] mx-auto px-4 space-y-6">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-[#2997ff]">
            Nexa Architecture
          </span>
          <h2 className="text-[34px] sm:text-[44px] font-semibold tracking-[-0.025em] leading-tight text-white">
            Built directly on Neon PostgreSQL. No intermediate mocks.
          </h2>
          <p className="text-[17px] text-[#cccccc] leading-relaxed max-w-xl mx-auto">
            From variant inventory deductions to real-time order history, every click executes server-side queries on PostgreSQL via Prisma ORM.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="apple-btn inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-[#1d1d1f] text-[14px] font-medium hover:bg-[#f5f5f7] transition"
            >
              Shop the Collection <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Apple New Arrivals (Parchment #f5f5f7) */}
      <section className="w-full bg-[#f5f5f7] py-20">
        <div className="max-w-[1024px] mx-auto px-4 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[#0066cc]">
                Fresh Releases
              </span>
              <h2 className="text-[34px] sm:text-[40px] font-semibold tracking-[-0.02em] text-[#1d1d1f] mt-1">
                Latest Additions.
              </h2>
            </div>
            <Link
              href="/products?sort=newest"
              className="text-[14px] text-[#0066cc] font-medium hover:underline flex items-center gap-1"
            >
              See all new releases <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
