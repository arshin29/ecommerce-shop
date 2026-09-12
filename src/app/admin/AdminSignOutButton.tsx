'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function AdminSignOutButton() {
  const router = useRouter();
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push('/login?redirect=/admin');
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loggingOut}
      className="p-1.5 rounded-full hover:bg-[#272729] text-[#86868b] hover:text-[#e03e3e] transition disabled:opacity-50"
      title="Sign Out of Admin Console"
      aria-label="Sign Out"
    >
      <LogOut className="w-3.5 h-3.5" />
    </button>
  );
}
