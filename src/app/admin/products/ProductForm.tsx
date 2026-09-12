'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import { productSchema, ProductFormData } from '@/lib/validations';
import { slugify } from '@/lib/formatters';

interface ProductFormProps {
  initialData?: any;
  categories: Array<{ id: string; name: string }>;
}

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const isEditing = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      shortDescription: initialData?.shortDescription || '',
      price: initialData?.price || 49.0,
      compareAtPrice: initialData?.compareAtPrice || null,
      sku: initialData?.sku || 'SKU-001',
      categoryId: initialData?.categoryId || categories[0]?.id || '',
      status: initialData?.status || 'PUBLISHED',
      featured: initialData?.featured || false,
      stock: initialData?.variants?.[0]?.stock || 25,
      tags: initialData?.tags || '["New", "Essentials"]',
      imageUrl: initialData?.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    },
  });

  const nameValue = watch('name');

  const handleGenerateSlug = () => {
    if (nameValue) {
      setValue('slug', slugify(nameValue));
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true);
    setFormError('');

    try {
      const url = '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing ? { ...data, id: initialData.id } : data;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (result.success) {
        router.push('/admin/products');
        router.refresh();
      } else {
        setFormError(result.error || 'Failed to save product');
        setSubmitting(false);
      }
    } catch {
      setFormError('Network error while saving product');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#86868b] hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        <button
          type="submit"
          disabled={submitting}
          className="apple-btn px-6 py-2.5 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white text-xs font-medium transition flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {submitting ? 'Saving...' : isEditing ? 'Update Product' : 'Save Product'}
        </button>
      </div>

      {formError && (
        <div className="p-4 rounded-[12px] bg-[#e03e3e]/10 text-[#e03e3e] border border-[#e03e3e]/20 text-xs">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight">General Information</h3>

            <div>
              <label className="block text-xs font-medium text-[#86868b] mb-1.5">Product Title *</label>
              <input
                type="text"
                {...register('name')}
                placeholder="e.g. Minimalist Ceramic Pour-Over"
                className="w-full px-4 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-[12px] text-white focus:outline-none focus:border-[#0066cc]"
              />
              {errors.name && <p className="text-[11px] text-[#e03e3e] mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium text-[#86868b]">URL Slug *</label>
                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  className="text-[11px] text-[#2997ff] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Auto-generate from title
                </button>
              </div>
              <input
                type="text"
                {...register('slug')}
                className="w-full px-4 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-[12px] text-white font-mono focus:outline-none focus:border-[#0066cc]"
              />
              {errors.slug && <p className="text-[11px] text-[#e03e3e] mt-1">{errors.slug.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#86868b] mb-1.5">Short Description</label>
              <input
                type="text"
                {...register('shortDescription')}
                placeholder="Brief teaser headline..."
                className="w-full px-4 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-[12px] text-white focus:outline-none focus:border-[#0066cc]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#86868b] mb-1.5">Full Description *</label>
              <textarea
                rows={4}
                {...register('description')}
                placeholder="Detailed craft specifications, materials, sizing..."
                className="w-full px-4 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-[12px] text-white focus:outline-none focus:border-[#0066cc]"
              />
              {errors.description && <p className="text-[11px] text-[#e03e3e] mt-1">{errors.description.message}</p>}
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight">Pricing & Stock</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#86868b] mb-1.5">Price (₹ INR) *</label>
                <input
                  type="number"
                  step="1"
                  {...register('price', { valueAsNumber: true })}
                  className="w-full px-4 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-[12px] text-white font-mono focus:outline-none focus:border-[#0066cc]"
                />
                {errors.price && <p className="text-[11px] text-[#e03e3e] mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#86868b] mb-1.5">Compare-at Price (₹ INR)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('compareAtPrice', { valueAsNumber: true })}
                  className="w-full px-4 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-[12px] text-white font-mono focus:outline-none focus:border-[#0066cc]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#86868b] mb-1.5">SKU (Inventory Identifier) *</label>
                <input
                  type="text"
                  {...register('sku')}
                  className="w-full px-4 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-[12px] text-white font-mono focus:outline-none focus:border-[#0066cc]"
                />
                {errors.sku && <p className="text-[11px] text-[#e03e3e] mt-1">{errors.sku.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#86868b] mb-1.5">Available Stock Units *</label>
                <input
                  type="number"
                  {...register('stock', { valueAsNumber: true })}
                  className="w-full px-4 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-[12px] text-white font-mono focus:outline-none focus:border-[#0066cc]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Category & Status */}
        <div className="space-y-6">
          <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight">Status & Visibility</h3>

            <div>
              <label className="block text-xs font-medium text-[#86868b] mb-1.5">Publishing Status</label>
              <select
                {...register('status')}
                className="w-full px-3.5 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-[12px] text-white focus:outline-none focus:border-[#0066cc]"
              >
                <option value="PUBLISHED">Published (Visible in Store)</option>
                <option value="DRAFT">Draft (Hidden)</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-[#a1a1a6] cursor-pointer">
                <input
                  type="checkbox"
                  {...register('featured')}
                  className="rounded bg-[#272729] border-[#3e3e42] text-[#0066cc] focus:ring-0"
                />
                Highlight as Featured on Homepage
              </label>
            </div>
          </div>

          <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight">Organization</h3>

            <div>
              <label className="block text-xs font-medium text-[#86868b] mb-1.5">Category *</label>
              <select
                {...register('categoryId')}
                className="w-full px-3.5 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-[12px] text-white focus:outline-none focus:border-[#0066cc]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#86868b] mb-1.5">Primary Image URL</label>
              <input
                type="text"
                {...register('imageUrl')}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-[12px] text-white focus:outline-none focus:border-[#0066cc]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#86868b] mb-1.5">Tags (JSON string)</label>
              <input
                type="text"
                {...register('tags')}
                className="w-full px-4 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-[12px] text-white font-mono focus:outline-none focus:border-[#0066cc]"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
