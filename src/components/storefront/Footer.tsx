import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#f5f5f7] text-[#86868b] text-[12px] border-t border-[#e5e5e7] pt-12 pb-16">
      <div className="max-w-[1024px] mx-auto px-4 space-y-8">
        {/* Footnotes / Legal Disclaimers in Apple micro-legal style */}
        <div className="space-y-2 text-[11px] text-[#86868b] leading-normal border-b border-[#d2d2d7] pb-6">
          <p>
            1. Free express delivery applies to orders over ₹999 across India. All transactions in this store are simulated for demo and evaluation purposes; no live credit cards or funds are processed.
          </p>
          <p>
            2. Real-time inventory deduction and order state progression are executed live against your Neon Serverless PostgreSQL instance using Prisma ORM.
          </p>
          <p>
            3. Promo code WELCOME10 provides 10% off cart subtotal during demo checkout.
          </p>
        </div>

        {/* Directory Columns in Apple relaxed leading style */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6 text-[12px]">
          <div>
            <h4 className="font-semibold text-[#1d1d1f] mb-3">Shop & Learn</h4>
            <ul className="space-y-2.5">
              <li><Link href="/products?category=apparel-footwear" className="hover:text-[#1d1d1f] hover:underline transition">Apparel</Link></li>
              <li><Link href="/products?category=audio-gadgets" className="hover:text-[#1d1d1f] hover:underline transition">Audio & Tech</Link></li>
              <li><Link href="/products?category=bags-carry" className="hover:text-[#1d1d1f] hover:underline transition">Bags & Carry</Link></li>
              <li><Link href="/products?category=workspace-desk" className="hover:text-[#1d1d1f] hover:underline transition">Workspace</Link></li>
              <li><Link href="/products?category=home-living" className="hover:text-[#1d1d1f] hover:underline transition">Living</Link></li>
              <li><Link href="/products?category=stationery-goods" className="hover:text-[#1d1d1f] hover:underline transition">Stationery</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#1d1d1f] mb-3">Account</h4>
            <ul className="space-y-2.5">
              <li><Link href="/account" className="hover:text-[#1d1d1f] hover:underline transition">Manage Your Account</Link></li>
              <li><Link href="/account" className="hover:text-[#1d1d1f] hover:underline transition">Nexa Store Orders</Link></li>
              <li><Link href="/cart" className="hover:text-[#1d1d1f] hover:underline transition">Shopping Bag</Link></li>
              <li><Link href="/login" className="hover:text-[#1d1d1f] hover:underline transition">Demo Login Hub</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#1d1d1f] mb-3">Store Operations</h4>
            <ul className="space-y-2.5">
              <li><Link href="/admin" className="text-[#0066cc] font-medium hover:underline transition">Admin Studio</Link></li>
              <li><Link href="/admin/products" className="hover:text-[#1d1d1f] hover:underline transition">Catalog Manager</Link></li>
              <li><Link href="/admin/orders" className="hover:text-[#1d1d1f] hover:underline transition">Order Fulfillment</Link></li>
              <li><Link href="/admin/inventory" className="hover:text-[#1d1d1f] hover:underline transition">Inventory Matrix</Link></li>
              <li><Link href="/admin/analytics" className="hover:text-[#1d1d1f] hover:underline transition">Store Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#1d1d1f] mb-3">Nexa Values</h4>
            <ul className="space-y-2.5">
              <li><span className="text-[#86868b]">Accessibility</span></li>
              <li><span className="text-[#86868b]">Environmental Craft</span></li>
              <li><span className="text-[#86868b]">Privacy & Security</span></li>
              <li><span className="text-[#86868b]">Supply Chain Integrity</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#1d1d1f] mb-3">About Nexa</h4>
            <ul className="space-y-2.5">
              <li><span className="text-[#86868b]">Newsroom</span></li>
              <li><span className="text-[#86868b]">Leadership</span></li>
              <li><span className="text-[#86868b]">Career Opportunities</span></li>
              <li><span className="text-[#86868b]">Investors</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright and Legal Row */}
        <div className="pt-6 border-t border-[#d2d2d7] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#86868b]">
          <p>© {new Date().getFullYear()} Nexa Inc. All rights reserved. Powered by Next.js, Prisma ORM, and Neon PostgreSQL.</p>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Terms of Use</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Sales and Refunds</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Legal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
