import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Boxes,
  Percent,
  BarChart3,
  Settings,
  ExternalLink,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { AdminSignOutButton } from './AdminSignOutButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/login?redirect=/admin&error=admin_required');
  }

  const navLinks = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/categories', label: 'Categories', icon: FolderTree },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/inventory', label: 'Inventory', icon: Boxes },
    { href: '/admin/discounts', label: 'Discounts', icon: Percent },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[#000000] text-[#f5f5f7] antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#161617] border-r border-[#333336] flex flex-col flex-shrink-0 hidden md:flex">
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#333336]">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white text-[#1d1d1f] flex items-center justify-center font-bold text-xs">
              N
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">
              Nexa <span className="text-[#86868b] font-normal text-xs">Studio</span>
            </span>
          </Link>
          <span className="px-2 py-0.5 rounded-full bg-[#0066cc]/20 text-[#2997ff] text-[10px] font-semibold border border-[#0066cc]/30">
            ADMIN
          </span>
        </div>

        {/* Storefront shortcut */}
        <div className="p-4 border-b border-[#333336]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-full bg-[#272729] hover:bg-[#333336] border border-[#3e3e42] text-xs font-medium text-[#f5f5f7] transition"
          >
            <span>Customer Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#86868b]" />
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium text-[#a1a1a6] hover:text-white hover:bg-[#272729] transition"
              >
                <Icon className="w-4 h-4 text-[#86868b]" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin profile footer with sign out */}
        <div className="p-4 border-t border-[#333336] bg-[#161617]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#272729] border border-[#3e3e42] text-white flex items-center justify-center font-semibold text-xs flex-shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#f5f5f7] truncate">{user.name}</p>
                <p className="text-[10px] text-[#86868b] truncate">{user.email}</p>
              </div>
            </div>
            <AdminSignOutButton />
          </div>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#000000]">
        {/* Top bar */}
        <header className="h-16 bg-[#161617] border-b border-[#333336] px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-[#a1a1a6]">Store Management Console</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium bg-[#0066cc]/15 text-[#2997ff] border border-[#0066cc]/30">
              <ShieldCheck className="w-3 h-3" />
              Authenticated as {user.name} ({user.role})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="apple-btn px-4 py-1.5 rounded-full bg-[#272729] hover:bg-[#333336] text-[#f5f5f7] text-xs font-medium border border-[#3e3e42] transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#86868b]" />
              View Storefront
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex overflow-x-auto p-2 gap-1.5 bg-[#161617] border-b border-[#333336] text-xs no-scrollbar">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-full bg-[#272729] text-[#f5f5f7] flex-shrink-0"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Dynamic page contents */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#000000]">{children}</main>
      </div>
    </div>
  );
}
