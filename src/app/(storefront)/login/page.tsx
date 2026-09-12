'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Shield, User, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  const handleQuickDemoLogin = (demoEmail: string, demoRole: 'ADMIN' | 'CUSTOMER') => {
    setError('');
    setEmail(demoEmail);
    setPassword(demoRole === 'ADMIN' ? 'Admin@123' : 'Customer@123');
  };

  return (
    <div className="bg-white rounded-[18px] border border-[#d2d2d7]/50 p-8 sm:p-10 space-y-6 shadow-sm">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center mx-auto text-lg font-bold">
          N
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight">
          Sign in with Nexa ID
        </h1>
        <p className="text-xs text-[#86868b] max-w-xs mx-auto">
          Manage your orders, saved addresses, or access store administrative controls.
        </p>
      </div>

      {redirectUrl.startsWith('/admin') && (
        <div className="p-3.5 rounded-[14px] bg-[#0066cc]/10 border border-[#0066cc]/25 text-xs text-[#0066cc] flex items-center gap-2 font-medium">
          <Shield className="w-4 h-4 flex-shrink-0" />
          <span>Admin Authentication Required. Sign in with administrator credentials to enter Nexa Studio.</span>
        </div>
      )}

      {/* Fill Demo Credentials */}
      <div className="p-4 rounded-[14px] bg-[#f5f5f7] border border-[#d2d2d7]/40 space-y-2.5">
        <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider text-center">
          Autofill Demo Credentials
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('admin@ecommerce.test', 'ADMIN')}
            className="apple-btn px-3 py-2 text-xs font-medium rounded-full bg-white border border-[#d2d2d7]/60 text-[#1d1d1f] hover:bg-[#e8e8ed] transition flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Shield className="w-3.5 h-3.5 text-[#0066cc]" />
            <span>Store Admin (Arshin)</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('customer@ecommerce.test', 'CUSTOMER')}
            className="apple-btn px-3 py-2 text-xs font-medium rounded-full bg-white border border-[#d2d2d7]/60 text-[#1d1d1f] hover:bg-[#e8e8ed] transition flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <User className="w-3.5 h-3.5 text-[#0066cc]" />
            <span>Customer</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-[12px] bg-[#fff2f2] text-[#e03e3e] text-xs border border-[#ffcccc] font-medium text-center">
          {error}
        </div>
      )}

      {/* Manual Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">Email</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#f5f5f7] border border-[#d2d2d7] rounded-[12px] focus:bg-white focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition"
            />
            <Mail className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">Password</label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#f5f5f7] border border-[#d2d2d7] rounded-[12px] focus:bg-white focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition"
            />
            <Lock className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="apple-btn w-full py-3 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white font-medium text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#f5f5f7] px-4 py-16">
      <div className="max-w-md w-full">
        <Suspense fallback={<div className="p-8 text-center text-xs text-[#86868b]">Loading sign in...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
