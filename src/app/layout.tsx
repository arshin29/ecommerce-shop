import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { WishlistDrawer } from '@/components/storefront/WishlistDrawer';

export const metadata: Metadata = {
  title: 'Nexa — Full-Stack Ecommerce Platform',
  description: 'A Shopify-inspired storefront + admin dashboard built with Next.js and Neon PostgreSQL.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-white text-[#1d1d1f] antialiased">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <CartDrawer />
              <WishlistDrawer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
