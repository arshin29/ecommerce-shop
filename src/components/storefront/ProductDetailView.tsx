'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Truck, RotateCcw, Check, ShoppingBag, ArrowRight, Heart } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string | null;
    price: number;
    compareAtPrice: number | null;
    sku: string;
    rating: number;
    reviewCount: number;
    images: Array<{ id: string; url: string; alt: string | null; isPrimary: boolean }>;
    variants: Array<{ id: string; title: string; sku: string; price: number; stock: number; options: string }>;
    category: { name: string; slug: string };
    reviews: Array<{ id: string; authorName: string; rating: number; title: string | null; comment: string; createdAt: Date }>;
  };
}

export function ProductDetailView({ product }: ProductDetailProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const [selectedImage, setSelectedImage] = useState(
    product.images.find((i) => i.isPrimary)?.url || product.images[0]?.url || ''
  );

  const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'shipping' | 'returns'>('desc');

  // Review Form
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : 10;
  const isOutOfStock = currentStock <= 0;

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > currentPrice;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      title: product.name,
      variantTitle: selectedVariant?.title,
      price: currentPrice,
      image: selectedImage,
      quantity,
      stock: currentStock,
      sku: selectedVariant?.sku || product.sku,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    handleAddToCart();
    router.push('/checkout');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          authorName: reviewName,
          authorEmail: reviewEmail,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewSuccess(true);
        setReviewName('');
        setReviewEmail('');
        setReviewTitle('');
        setReviewComment('');
      }
    } catch {
      // ignore
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* 2-Column Product Configurator Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Gallery on Left (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] sm:aspect-square w-full bg-[#f5f5f7] rounded-[24px] overflow-hidden flex items-center justify-center p-6 border border-[#e5e5e7]">
            <img
              src={selectedImage}
              alt={product.name}
              className="max-h-[500px] w-full h-full object-contain"
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-20 h-20 rounded-[12px] bg-[#f5f5f7] overflow-hidden border transition flex-shrink-0 ${
                    selectedImage === img.url
                      ? 'border-[#0066cc] ring-2 ring-[#0066cc]/20'
                      : 'border-[#e5e5e7] hover:border-[#d2d2d7]'
                  }`}
                >
                  <img src={img.url} alt={img.alt || product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Purchase Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-8 sticky top-24">
          <div className="space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#b64400]">
              {product.category.name}
            </span>
            <h1 className="text-[34px] sm:text-[40px] font-semibold text-[#1d1d1f] tracking-[-0.025em] leading-tight">
              Buy {product.name}
            </h1>
            <p className="text-[17px] text-[#86868b] leading-relaxed">
              {product.shortDescription || 'Designed with premium craftsmanship.'}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2 text-[13px] text-[#86868b] pt-1">
              <div className="flex text-[#f5a623]">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="font-semibold text-[#1d1d1f]">{product.rating.toFixed(1)}</span>
              <span>({product.reviewCount} customer reviews)</span>
            </div>
          </div>

          {/* Pricing & Stock Banner */}
          <div className="p-5 rounded-[18px] bg-[#f5f5f7] border border-[#e5e5e7] space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-[32px] font-semibold tracking-tight text-[#1d1d1f]">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-[17px] text-[#86868b] line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            <p className="text-[12px] text-[#86868b]">
              Free delivery and free returns included. SKU: <span className="font-mono">{selectedVariant?.sku || product.sku}</span>
            </p>
          </div>

          {/* Apple Configurator Option Chips */}
          {product.variants.length > 0 && (
            <div className="space-y-3">
              <label className="block text-[13px] font-semibold text-[#1d1d1f]">
                Select Variation
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const variantOutOfStock = variant.stock <= 0;

                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={variantOutOfStock}
                      className={`apple-btn px-5 py-2.5 rounded-full text-[13px] font-medium border transition ${
                        isSelected
                          ? 'border-[#0071e3] bg-[#0071e3]/10 text-[#0066cc] ring-1 ring-[#0071e3]'
                          : variantOutOfStock
                          ? 'border-[#e5e5e7] bg-[#f5f5f7] text-[#86868b] line-through cursor-not-allowed'
                          : 'border-[#d2d2d7] bg-white text-[#1d1d1f] hover:border-[#86868b]'
                      }`}
                    >
                      {variant.title} {variant.stock <= 5 && variant.stock > 0 && `(Only ${variant.stock} left)`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Status Pill */}
          <div>
            {isOutOfStock ? (
              <span className="inline-block px-3 py-1 rounded-full text-[12px] font-medium bg-[#f5f5f7] text-[#86868b]">
                Currently Out of Stock
              </span>
            ) : currentStock <= 5 ? (
              <span className="inline-block px-3 py-1 rounded-full text-[12px] font-medium bg-[#fff2e5] text-[#b64400]">
                ⚡ Low Stock: Only {currentStock} units remaining
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#eefbf1] text-[#34c759]">
                <Check className="w-3.5 h-3.5" /> In Stock — Ships within 24 hours
              </span>
            )}
          </div>

          {/* Actions: Add to Bag & Buy Now */}
          <div className="space-y-3 pt-4 border-t border-[#e5e5e7]">
            <div className="flex items-center gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center border border-[#d2d2d7] rounded-full bg-white px-3 py-1.5">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-[#86868b] hover:text-[#1d1d1f] px-2 font-bold"
                >
                  -
                </button>
                <span className="px-2 text-[14px] font-medium text-[#1d1d1f]">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={quantity >= currentStock}
                  className="text-[#86868b] hover:text-[#1d1d1f] px-2 font-bold disabled:opacity-30"
                >
                  +
                </button>
              </div>

              {/* Add to Bag Pill */}
              <button
                id="add-to-cart-button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`apple-btn flex-1 py-3 px-6 rounded-full text-[14px] font-medium transition flex items-center justify-center gap-2 ${
                  added
                    ? 'bg-[#34c759] text-white'
                    : isOutOfStock
                    ? 'bg-[#f5f5f7] text-[#86868b] cursor-not-allowed'
                    : 'bg-[#0066cc] hover:bg-[#0071e3] text-white shadow-xs'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Bag
                  </>
                )}
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="apple-btn w-full py-3 px-6 rounded-full bg-[#1d1d1f] hover:bg-black text-white text-[14px] font-medium transition shadow-xs"
            >
              Express Demo Checkout
            </button>

            {/* Wishlist Action */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`apple-btn w-full py-3 px-6 rounded-full border text-[14px] font-medium transition flex items-center justify-center gap-2 ${
                inWishlist
                  ? 'bg-[#fff0f0] border-[#ffcccc] text-[#e03e3e]'
                  : 'bg-white border-[#d2d2d7] hover:bg-[#f5f5f7] text-[#1d1d1f]'
              }`}
            >
              <Heart className={`w-4 h-4 transition ${inWishlist ? 'fill-current text-[#e03e3e]' : ''}`} />
              <span>{inWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs & Description */}
      <div className="bg-[#f5f5f7] rounded-[24px] p-8 border border-[#e5e5e7] space-y-6">
        <div className="flex gap-8 border-b border-[#d2d2d7] pb-3 text-[14px]">
          <button
            onClick={() => setActiveTab('desc')}
            className={`font-semibold pb-2 border-b-2 transition ${
              activeTab === 'desc' ? 'border-[#0066cc] text-[#0066cc]' : 'border-transparent text-[#86868b]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`font-semibold pb-2 border-b-2 transition ${
              activeTab === 'shipping' ? 'border-[#0066cc] text-[#0066cc]' : 'border-transparent text-[#86868b]'
            }`}
          >
            Delivery & Support
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            className={`font-semibold pb-2 border-b-2 transition ${
              activeTab === 'returns' ? 'border-[#0066cc] text-[#0066cc]' : 'border-transparent text-[#86868b]'
            }`}
          >
            Returns Policy
          </button>
        </div>

        <div className="text-[15px] text-[#1d1d1f] leading-relaxed max-w-3xl">
          {activeTab === 'desc' && <p>{product.description}</p>}
          {activeTab === 'shipping' && (
            <p>Every order is dispatched via carbon-neutral express courier within 24 hours. Free standard express delivery on all orders over ₹999.</p>
          )}
          {activeTab === 'returns' && (
            <p>Enjoy 30 days of risk-free trial. Return any item in original packaging for a 100% full refund with prepaid return shipping.</p>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-[24px] p-8 border border-[#e5e5e7] space-y-8">
        <div>
          <h2 className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight">Customer Ratings & Reviews</h2>
          <p className="text-[14px] text-[#86868b] mt-1">Real feedback submitted to Neon PostgreSQL.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {product.reviews.map((rev) => (
            <div key={rev.id} className="p-5 rounded-[18px] bg-[#f5f5f7] border border-[#e5e5e7] space-y-2">
              <div className="flex items-center gap-1 text-[#f5a623]">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <h4 className="text-[14px] font-semibold text-[#1d1d1f]">{rev.title || 'Verified Owner'}</h4>
              <p className="text-[13px] text-[#1d1d1f] leading-relaxed">{rev.comment}</p>
              <p className="text-[11px] text-[#86868b]">— {rev.authorName}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="pt-6 border-t border-[#e5e5e7]">
          <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">Leave Feedback</h3>
          {reviewSuccess ? (
            <div className="p-4 rounded-[14px] bg-[#eefbf1] text-[#34c759] text-[13px] font-medium">
              Thank you. Your review has been saved to the database.
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4 max-w-lg text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Your Name *"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="px-4 py-2 border border-[#d2d2d7] rounded-xl focus:outline-none focus:border-[#0066cc]"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={reviewEmail}
                  onChange={(e) => setReviewEmail(e.target.value)}
                  className="px-4 py-2 border border-[#d2d2d7] rounded-xl focus:outline-none focus:border-[#0066cc]"
                />
              </div>

              <div>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="px-3 py-2 border border-[#d2d2d7] rounded-xl focus:outline-none text-[13px]"
                >
                  <option value={5}>5 Stars — Excellent</option>
                  <option value={4}>4 Stars — Very Good</option>
                  <option value={3}>3 Stars — Average</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Review Headline"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="w-full px-4 py-2 border border-[#d2d2d7] rounded-xl focus:outline-none focus:border-[#0066cc]"
              />

              <textarea
                rows={3}
                required
                placeholder="Detailed experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-4 py-2 border border-[#d2d2d7] rounded-xl focus:outline-none focus:border-[#0066cc]"
              />

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="apple-btn px-6 py-2 rounded-full bg-[#0066cc] text-white font-medium text-[13px] hover:bg-[#0071e3] transition disabled:opacity-40"
              >
                {reviewSubmitting ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
