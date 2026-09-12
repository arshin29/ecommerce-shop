'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Check, ShieldCheck } from 'lucide-react';

export function SettingsForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const router = useRouter();
  const [storeName, setStoreName] = useState(initialSettings['STORE_NAME'] || 'Nexa — Full-Stack Ecommerce Platform');
  const [storeTagline, setStoreTagline] = useState(initialSettings['STORE_TAGLINE'] || 'A Shopify-inspired storefront + admin dashboard built with Next.js and Neon PostgreSQL.');
  const [storeEmail, setStoreEmail] = useState(initialSettings['STORE_EMAIL'] || 'support@nexa.test');
  const [currency, setCurrency] = useState(initialSettings['CURRENCY'] || 'INR');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(initialSettings['FREE_SHIPPING_THRESHOLD'] || '999');
  const [defaultShippingFee, setDefaultShippingFee] = useState(initialSettings['DEFAULT_SHIPPING_FEE'] || '99');
  const [announcementMessage, setAnnouncementMessage] = useState(
    initialSettings['ANNOUNCEMENT_MESSAGE'] || 'Free express shipping on orders over ₹999 | Use code WELCOME10 for 10% off'
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          STORE_NAME: storeName,
          STORE_TAGLINE: storeTagline,
          STORE_EMAIL: storeEmail,
          CURRENCY: currency,
          FREE_SHIPPING_THRESHOLD: freeShippingThreshold,
          DEFAULT_SHIPPING_FEE: defaultShippingFee,
          ANNOUNCEMENT_MESSAGE: announcementMessage,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        router.refresh();
      }
    } catch {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Brand Identity */}
      <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">Store Identity</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#86868b] mb-1.5">Store Name</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-[12px] text-white focus:outline-none focus:border-[#0066cc]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#86868b] mb-1.5">Customer Support Email</label>
            <input
              type="email"
              value={storeEmail}
              onChange={(e) => setStoreEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-[12px] text-white focus:outline-none focus:border-[#0066cc]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#86868b] mb-1.5">Store Headline / Tagline</label>
          <input
            type="text"
            value={storeTagline}
            onChange={(e) => setStoreTagline(e.target.value)}
            className="w-full px-4 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-[12px] text-white focus:outline-none focus:border-[#0066cc]"
          />
        </div>
      </div>

      {/* Storefront Announcements & Shipping */}
      <div className="bg-[#161617] p-6 rounded-[18px] border border-[#333336] space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">Announcement & Delivery</h3>

        <div>
          <label className="block text-xs font-medium text-[#86868b] mb-1.5">Top Banner Announcement</label>
          <input
            type="text"
            value={announcementMessage}
            onChange={(e) => setAnnouncementMessage(e.target.value)}
            className="w-full px-4 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-[12px] text-white focus:outline-none focus:border-[#0066cc]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#86868b] mb-1.5">Free Shipping Threshold (₹)</label>
            <input
              type="number"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-[12px] text-white font-mono focus:outline-none focus:border-[#0066cc]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#86868b] mb-1.5">Default Shipping Fee (₹)</label>
            <input
              type="number"
              step="1"
              value={defaultShippingFee}
              onChange={(e) => setDefaultShippingFee(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-[12px] text-white font-mono focus:outline-none focus:border-[#0066cc]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#86868b] mb-1.5">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-[12px] text-white focus:outline-none focus:border-[#0066cc]"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-[#86868b]">Changes take effect immediately across all storefront sessions.</span>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-xs text-[#2997ff] font-medium flex items-center gap-1">
              <Check className="w-4 h-4" /> Configuration Synced!
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="apple-btn px-6 py-2.5 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white text-xs font-medium transition flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
