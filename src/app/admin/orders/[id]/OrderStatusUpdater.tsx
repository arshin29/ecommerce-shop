'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

interface Props {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
}

export function OrderStatusUpdater({ orderId, currentStatus, currentPaymentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleUpdate = async (newStatus: string, newPaymentStatus: string) => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          paymentStatus: newPaymentStatus,
        }),
      });

      if (res.ok) {
        setStatus(newStatus);
        setPaymentStatus(newPaymentStatus);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    } catch {
      alert('Failed to update order status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div>
        <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#86868b] mb-1">
          Fulfillment
        </label>
        <select
          value={status}
          disabled={saving}
          onChange={(e) => handleUpdate(e.target.value, paymentStatus)}
          className="px-3.5 py-1.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-full text-white focus:outline-none focus:border-[#0066cc]"
        >
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#86868b] mb-1">
          Payment
        </label>
        <select
          value={paymentStatus}
          disabled={saving}
          onChange={(e) => handleUpdate(status, e.target.value)}
          className="px-3.5 py-1.5 text-xs bg-[#272729] border border-[#3e3e42] rounded-full text-white focus:outline-none focus:border-[#0066cc]"
        >
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {saved && (
        <span className="text-xs font-medium text-[#2997ff] flex items-center gap-1 self-end pb-1.5">
          <Check className="w-3.5 h-3.5" /> Synced!
        </span>
      )}
    </div>
  );
}
