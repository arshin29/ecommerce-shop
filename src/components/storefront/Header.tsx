'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, User, Menu, X, ShieldAlert, ChevronRight, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';

export function Header() {
  const router = useRouter();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* 1. Apple Global Nav (44px, Pure Black #000000, 12px SF Pro Text) */}
      <div className="bg-[#000000] text-[#e8e8ed] text-[12px] h-[44px] flex items-center border-b border-white/10">
        <div className="max-w-[1024px] mx-auto w-full px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition font-semibold tracking-tight">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.85-11.93-14.42-6-9.28-10.77-19.86-14.33-31.76-3.56-11.9-5.34-23.01-5.34-33.34 0-14.35 3.56-26.04 10.68-35.08 7.12-9.04 16.03-13.68 26.73-13.92 4.35 0 9.24 1.16 14.67 3.48 5.43 2.32 9.24 3.54 11.43 3.66 1.74-.12 5.76-1.42 12.06-3.9 6.3-2.47 11.39-3.53 15.27-3.17 11.41.61 20.35 4.88 26.83 12.82-9.78 5.86-14.54 14.18-14.28 24.97.26 8.35 3.39 15.34 9.39 20.97 6 5.63 13.19 8.94 21.57 9.94-1.85 5.66-4.14 11.63-6.86 17.92zM119.22 32.64c0-7.39 2.65-14.37 7.95-20.94 5.3-6.57 11.98-10.77 20.04-12.6 1.09 7.83-1.44 15.02-7.58 21.57-6.14 6.55-13.29 10.51-21.45 11.87.16-.92.24-1.87.24-2.85z" />
            </svg>
            <span className="font-semibold tracking-normal text-[13px]">Nexa</span>
          </Link>

          {/* Global Links */}
          <nav className="hidden md:flex items-center space-x-7 text-[#d2d2d7]">
            <Link href="/products" className="hover:text-white transition-colors">Store</Link>
            <Link href="/products?category=apparel-footwear" className="hover:text-white transition-colors">Apparel</Link>
            <Link href="/products?category=audio-gadgets" className="hover:text-white transition-colors">Audio</Link>
            <Link href="/products?category=bags-carry" className="hover:text-white transition-colors">Carry</Link>
            <Link href="/products?category=workspace-desk" className="hover:text-white transition-colors">Workspace</Link>
            <Link href="/products?category=home-living" className="hover:text-white transition-colors">Living</Link>
            <Link href="/products?category=stationery-goods" className="hover:text-white transition-colors">Goods</Link>
          </nav>

          {/* Quick Utility Right Cluster */}
          <div className="flex items-center gap-4 text-[#d2d2d7]">
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-[#2997ff] hover:underline"
              >
                Admin Panel
              </Link>
            )}

            <button
              onClick={() => setIsWishlistOpen(true)}
              className="hover:text-white transition relative flex items-center"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className={`w-3.5 h-3.5 ${wishlistCount > 0 ? 'fill-current text-[#e03e3e]' : ''}`} />
              {wishlistCount > 0 && (
                <span className="ml-1 text-[10px] font-bold text-white bg-[#e03e3e] rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="hover:text-white transition relative flex items-center"
              aria-label="Bag"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {itemCount > 0 && (
                <span className="ml-1 text-[10px] font-bold text-white bg-[#0066cc] rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1 text-white hover:opacity-80"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Apple Frosted Sub-Nav (52px, frosted parchment, 21px title + action pills) */}
      <div className="apple-frosted border-b border-[#e5e5e7] text-[#1d1d1f] h-[52px] flex items-center transition-colors">
        <div className="max-w-[1024px] mx-auto w-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-semibold text-[19px] sm:text-[21px] tracking-tight text-[#1d1d1f] hover:opacity-80 transition">
              Nexa
            </Link>
            <span className="hidden sm:inline-block text-[12px] text-[#86868b]">
              Full-Stack Ecommerce Platform
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Apple Pill Search Input */}
            <form onSubmit={handleSearch} className="hidden sm:flex relative items-center">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-60 h-[32px] pl-8 pr-3 text-[12px] bg-[#f5f5f7] rounded-full border border-black/5 focus:bg-white focus:border-[#0066cc] focus:outline-none transition"
              />
              <Search className="w-3.5 h-3.5 text-[#86868b] absolute left-2.5 pointer-events-none" />
            </form>

            {/* Account link */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 text-[12px] text-[#1d1d1f] hover:text-[#0066cc] transition px-2 py-1"
                >
                  <span className="font-medium truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="text-[12px] text-[#1d1d1f] hover:text-[#0066cc] transition flex items-center gap-1 font-medium"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}

              {userMenuOpen && user && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-black/5 py-1 z-50 text-[13px]">
                  <div className="px-4 py-2 border-b border-[#f5f5f7]">
                    <p className="font-semibold text-[#1d1d1f] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#86868b] truncate">{user.email}</p>
                  </div>
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-[#0066cc] hover:bg-[#f5f5f7] font-medium"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/account"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-[#1d1d1f] hover:bg-[#f5f5f7]"
                  >
                    Your Orders
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-[#1d1d1f] hover:bg-[#f5f5f7] flex items-center justify-between"
                  >
                    <span>Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="text-[10px] font-bold text-white bg-[#e03e3e] px-1.5 py-0.2 rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-[#f5f5f7]"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Apple Wishlist Button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="apple-btn h-[32px] px-3 rounded-full border border-black/10 bg-white hover:bg-[#f5f5f7] text-[#1d1d1f] hover:text-[#e03e3e] text-[12px] font-medium transition shadow-2xs flex items-center gap-1.5"
              aria-label="Wishlist"
              title="Saved Items"
            >
              <Heart className={`w-3.5 h-3.5 ${wishlistCount > 0 ? 'fill-current text-[#e03e3e]' : ''}`} />
              <span className="hidden sm:inline">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="text-[10px] font-bold text-white bg-[#e03e3e] rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Apple Primary Action Blue Pill */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="apple-btn h-[32px] px-4 rounded-full bg-[#0066cc] text-white text-[12px] font-medium hover:bg-[#0071e3] transition shadow-xs flex items-center gap-1.5"
            >
              <span>Bag</span>
              {itemCount > 0 && <span className="opacity-90">({itemCount})</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#161617] text-white px-6 py-6 border-b border-white/10 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[36px] pl-9 pr-4 text-[13px] bg-white/10 rounded-full text-white placeholder-white/50 focus:outline-none"
            />
            <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="flex flex-col space-y-3 text-[15px] font-medium pt-2">
            <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="py-1 border-b border-white/10">All Products</Link>
            <Link href="/products?category=apparel-footwear" onClick={() => setMobileMenuOpen(false)} className="py-1 border-b border-white/10">Apparel</Link>
            <Link href="/products?category=audio-gadgets" onClick={() => setMobileMenuOpen(false)} className="py-1 border-b border-white/10">Audio</Link>
            <Link href="/products?category=bags-carry" onClick={() => setMobileMenuOpen(false)} className="py-1 border-b border-white/10">Carry</Link>
            <Link href="/products?category=workspace-desk" onClick={() => setMobileMenuOpen(false)} className="py-1 border-b border-white/10">Workspace</Link>
            <Link href="/products?category=home-living" onClick={() => setMobileMenuOpen(false)} className="py-1 border-b border-white/10">Home</Link>
            <Link href="/products?category=stationery-goods" onClick={() => setMobileMenuOpen(false)} className="py-1 border-b border-white/10">Stationery</Link>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {user?.role === 'ADMIN' && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="text-[#2997ff] text-[13px] font-medium">
                Go to Admin Dashboard →
              </Link>
            )}
            <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="text-white/80 text-[13px] flex items-center justify-between">
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="text-[10px] font-semibold bg-[#e03e3e] text-white px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="text-white/80 text-[13px]">
              {user ? 'My Account' : 'Sign In'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
