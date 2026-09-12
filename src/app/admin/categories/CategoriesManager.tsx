'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, FolderTree } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  _count: { products: number };
}

export function CategoriesManager({ categories }: { categories: CategoryItem[] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, image }),
      });

      if (res.ok) {
        setName('');
        setDescription('');
        setImage('');
        setShowModal(false);
        router.refresh();
      }
    } catch {
      alert('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      router.refresh();
    } catch {
      alert('Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="apple-btn px-5 py-2.5 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-[#161617] rounded-[18px] border border-[#333336] overflow-hidden flex flex-col justify-between"
          >
            {cat.image ? (
              <div className="aspect-video w-full bg-[#272729] overflow-hidden relative">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-medium bg-[#161617]/80 backdrop-blur-xs text-[#f5f5f7] border border-[#333336]">
                  {cat._count.products} products
                </span>
              </div>
            ) : (
              <div className="aspect-video w-full bg-[#272729] flex items-center justify-center text-[#86868b]">
                <FolderTree className="w-8 h-8" />
              </div>
            )}

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm text-white">{cat.name}</h3>
                <p className="text-xs text-[#86868b] mt-1 line-clamp-2">{cat.description || 'No description provided'}</p>
                <p className="text-[10px] font-mono text-[#2997ff] mt-2">slug: /{cat.slug}</p>
              </div>

              <div className="pt-4 border-t border-[#333336] mt-4 flex items-center justify-between text-xs">
                <span className="text-[#86868b]">{cat._count.products} items</span>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-1.5 rounded-full hover:bg-[#272729] text-[#86868b] hover:text-[#e03e3e] transition"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#161617] border border-[#333336] rounded-[18px] p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white tracking-tight">Add New Category</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#86868b] font-medium mb-1.5">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="Audio & Acoustics"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-[12px] bg-[#272729] border border-[#3e3e42] text-white focus:outline-none focus:border-[#0066cc]"
                />
              </div>

              <div>
                <label className="block text-[#86868b] font-medium mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="High-fidelity headphones, studio monitors, and cables."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-[12px] bg-[#272729] border border-[#3e3e42] text-white focus:outline-none focus:border-[#0066cc]"
                />
              </div>

              <div>
                <label className="block text-[#86868b] font-medium mb-1.5">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-[12px] bg-[#272729] border border-[#3e3e42] text-white focus:outline-none focus:border-[#0066cc]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="apple-btn px-4 py-2 rounded-full text-xs font-medium text-[#86868b] hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="apple-btn px-5 py-2 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white text-xs font-medium transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
