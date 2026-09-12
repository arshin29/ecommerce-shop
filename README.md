# Aura Commerce — Full-Stack Mini-Shopify Platform

A production-style, product-agnostic ecommerce platform built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **Neon PostgreSQL**.

Includes both:
1. **A Customer Storefront** with catalog search, multi-axis filtering, variant selection, live shopping bag with promo codes, and multi-step demo checkout.
2. **A Shopify-Style Admin Dashboard** for product management, stock matrices, fulfillment transitions, customer directories, coupon engines, analytics, and store configuration.

---

## 🌟 Key Features

* **Generic & Product-Agnostic**: Suitable for apparel, acoustics, home goods, workspace accessories, stationery, or any physical goods.
* **Database Driven**: Powered directly by Neon PostgreSQL with full relational models (`User`, `Category`, `Product`, `ProductImage`, `ProductVariant`, `Inventory`, `Cart`, `Order`, `OrderItem`, `Coupon`, `ProductReview`, `Address`, `StoreSetting`).
* **Realistic Demo Payment Flow**: Simulates Demo Cards, Demo UPI, and Cash on Delivery with server-side inventory deduction, automatic order number generation, and receipt confirmation.
* **Shopify-Style Admin Portal**: Dark theme operations dashboard featuring financial activity graphs, low-stock warnings, inline inventory adjustment, product variant creators, and status transitions.
* **Role-Based Authentication**: Stateless JWT session handling (`jose`) with `httpOnly` secure cookies, featuring 1-click Demo Admin & Demo Customer evaluation buttons.

---

## 🚀 Quick Start Guide

### Prerequisites
* Node.js 20+ (Node.js 24 recommended)
* npm 10+
* A Neon PostgreSQL account ([neon.tech](https://neon.tech))

### 1. Create a Neon Database
1. Go to [Neon Console](https://console.neon.tech/) and create a new project (e.g., `aura-commerce`).
2. Copy your connection string from the Neon dashboard. It typically looks like:
   ```text
   postgresql://[user]:[password]@[endpoint-pooler].[region].aws.neon.tech/neondb?sslmode=require
   ```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update your `.env` file:
```env
DATABASE_URL="your-neon-database-url-here"
AUTH_SECRET="your-32-character-random-secret-key"
```

### 3. Apply Schema to Neon PostgreSQL
Push the relational schema and generate the Prisma Client:
```bash
npx prisma db push
npx prisma generate
```

### 4. Seed the Database
Populate 6 categories, 21 generic products with images & variants, demo customers, completed orders, and active coupons:
```bash
npm run seed
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Login Credentials

For quick evaluation without manual signups, visit [/login](http://localhost:3000/login):

| Role | Email | Password | Quick Action |
|---|---|---|---|
| **Admin** | `admin@ecommerce.test` | `Admin@123` | Click **"Demo Admin"** button |
| **Customer** | `customer@ecommerce.test` | `Customer@123` | Click **"Demo Customer"** button |

### Active Demo Promo Codes
* `WELCOME10`: 10% off entire order
* `SAVE20`: $20 off orders over $100
* `FREESHIP`: $8.50 off shipping fee

---

## 🛠️ Tech Stack

* **Framework**: Next.js 16 (Turbopack, App Router)
* **Language**: TypeScript 5
* **Database**: Neon Serverless PostgreSQL
* **ORM**: Prisma ORM 7 (`@prisma/adapter-pg`)
* **Styling**: Tailwind CSS v4 & Lucide Icons
* **Validation**: Zod & React Hook Form
* **Authentication**: Stateless JWT (`jose`) & `bcryptjs`

---

## 📦 Production Commands

* **Type Check**: `npx tsc --noEmit`
* **Production Build**: `npm run build`
* **Start Production Server**: `npm run start`
* **Prisma Studio**: `npx prisma studio`
