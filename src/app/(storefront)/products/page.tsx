import React from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, ArrowUpDown, Check, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/storefront/ProductCard';

export const dynamic = 'force-dynamic';

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    featured?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const { category, search, sort, minPrice, maxPrice, inStock, featured } = params;

  // Build Prisma query filter
  const where: any = {
    status: 'PUBLISHED',
  };

  if (category) {
    where.category = { slug: category };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (featured === 'true') {
    where.featured = true;
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  // Sorting
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price-asc') orderBy = { price: 'asc' };
  else if (sort === 'price-desc') orderBy = { price: 'desc' };
  else if (sort === 'rating') orderBy = { rating: 'desc' };
  else if (sort === 'newest') orderBy = { createdAt: 'desc' };
  else if (sort === 'featured') orderBy = [{ featured: 'desc' }, { rating: 'desc' }];

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: true,
        variants: true,
        category: { select: { name: true, slug: true } },
      },
      orderBy,
    }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    }),
  ]);

  // Filter inStock in memory if requested
  const filteredProducts = inStock === 'true'
    ? products.filter((p) => p.variants.some((v) => v.stock > 0))
    : products;

  const currentCategoryName = category
    ? categories.find((c) => c.slug === category)?.name || 'Collection'
    : 'All Products';

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f]">
      {/* Apple Store Hero Section */}
      <section className="bg-[#f5f5f7] border-b border-[#d2d2d7]/50 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0066cc]">
            Store Catalog
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f]">
            {currentCategoryName}
          </h1>
          <p className="text-sm sm:text-base text-[#86868b] max-w-xl mx-auto">
            Engineered with precision and premium craftsmanship. Discover {filteredProducts.length} items available now.
          </p>

          {/* Quick Search Pill */}
          <div className="pt-4 max-w-md mx-auto">
            <form action="/products" method="GET" className="relative">
              {category && <input type="hidden" name="category" value={category} />}
              <Search className="w-4 h-4 text-[#86868b] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="search"
                defaultValue={search || ''}
                placeholder="Search products, materials, or features..."
                className="w-full pl-11 pr-5 py-3 text-sm bg-white border border-[#d2d2d7]/80 rounded-full shadow-sm placeholder-[#86868b] focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 transition"
              />
            </form>
          </div>
        </div>
      </section>

      {/* Category Pills Navigation Carousel */}
      <section className="border-b border-[#d2d2d7]/50 bg-white sticky top-[96px] z-20 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 flex-nowrap">
            <Link
              href={`/products${search ? `?search=${encodeURIComponent(search)}` : ''}`}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                !category
                  ? 'bg-[#1d1d1f] text-white shadow-sm'
                  : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
              }`}
            >
              All Items
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  category === c.slug
                    ? 'bg-[#1d1d1f] text-white shadow-sm'
                    : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
                }`}
              >
                {c.name} <span className="text-[10px] opacity-70 ml-1">({c._count.products})</span>
              </Link>
            ))}
          </div>

          {/* Quick Filter Toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href={`/products?${category ? `category=${category}&` : ''}${search ? `search=${encodeURIComponent(search)}&` : ''}inStock=${inStock === 'true' ? 'false' : 'true'}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition ${
                inStock === 'true'
                  ? 'border-[#0066cc] bg-[#0066cc]/10 text-[#0066cc]'
                  : 'border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]'
              }`}
            >
              {inStock === 'true' && <Check className="w-3 h-3" />}
              In Stock Only
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Sort and Results Count Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-[#d2d2d7]/50 gap-4">
          <p className="text-xs text-[#86868b]">
            Showing <strong className="text-[#1d1d1f] font-semibold">{filteredProducts.length}</strong> products
            {search && <span> matching &ldquo;<span className="text-[#1d1d1f]">{search}</span>&rdquo;</span>}
          </p>

          {/* Sort Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-[#86868b] mr-1">Sort:</span>
            {[
              { label: 'Featured', value: 'featured' },
              { label: 'Price: Low-High', value: 'price-asc' },
              { label: 'Price: High-Low', value: 'price-desc' },
              { label: 'Top Rated', value: 'rating' },
              { label: 'Newest', value: 'newest' },
            ].map((s) => (
              <Link
                key={s.value}
                href={`/products?${category ? `category=${category}&` : ''}${search ? `search=${encodeURIComponent(search)}&` : ''}${inStock ? `inStock=${inStock}&` : ''}sort=${s.value}`}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  sort === s.value || (!sort && s.value === 'featured')
                    ? 'bg-[#0066cc] text-white shadow-sm'
                    : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-[#f5f5f7] rounded-[18px] p-16 text-center max-w-xl mx-auto border border-[#d2d2d7]/40">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto mb-4 text-[#86868b] shadow-sm">
              <Search className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#1d1d1f]">No matching products found</h2>
            <p className="text-xs text-[#86868b] mt-2 leading-relaxed">
              We couldn&apos;t find any items matching your selected criteria. Try resetting your search or exploring our full catalog.
            </p>
            <div className="mt-6">
              <Link
                href="/products"
                className="apple-btn inline-block px-5 py-2 rounded-full bg-[#0066cc] text-white text-xs font-medium hover:bg-[#0077ed] transition"
              >
                Reset All Filters
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
