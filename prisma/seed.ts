import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is missing.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed for mini-Shopify platform...');

  // 1. Clean existing records in correct relation order
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.storeSetting.deleteMany();

  // 2. Users (Admin + Customers)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ecommerce.test';
  const adminRawPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const customerEmail = process.env.CUSTOMER_EMAIL || 'customer@ecommerce.test';
  const customerRawPassword = process.env.CUSTOMER_PASSWORD || 'Customer@123';

  const adminPassword = await bcrypt.hash(adminRawPassword, 10);
  const customerPassword = await bcrypt.hash(customerRawPassword, 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Arshin',
      email: adminEmail,
      passwordHash: adminPassword,
      role: 'ADMIN',
      phone: '+1 (555) 234-5678',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: 'Marcus Chen',
      email: customerEmail,
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      phone: '+1 (555) 876-5432',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'Sophia Rodriguez',
      email: 'sophia@example.com',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      phone: '+1 (555) 432-1098',
    },
  });

  // Customer Addresses
  await prisma.address.create({
    data: {
      userId: customer1.id,
      fullName: 'Marcus Chen',
      company: 'Chen Studio Inc',
      addressLine1: '742 Evergreen Terrace',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'United States',
      phone: '+1 (555) 876-5432',
      isDefault: true,
    },
  });

  await prisma.address.create({
    data: {
      userId: customer2.id,
      fullName: 'Sophia Rodriguez',
      addressLine1: '120 Broadway Ave, Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10006',
      country: 'United States',
      phone: '+1 (555) 432-1098',
      isDefault: true,
    },
  });

  // 3. Store Settings
  await prisma.storeSetting.createMany({
    data: [
      { key: 'STORE_NAME', value: 'Nexa — Full-Stack Ecommerce Platform' },
      { key: 'STORE_TAGLINE', value: 'A Shopify-inspired storefront + admin dashboard built with Next.js and Neon PostgreSQL.' },
      { key: 'STORE_EMAIL', value: 'support@nexa.test' },
      { key: 'CURRENCY', value: 'INR' },
      { key: 'FREE_SHIPPING_THRESHOLD', value: '999' },
      { key: 'DEFAULT_SHIPPING_FEE', value: '99' },
      { key: 'ANNOUNCEMENT_MESSAGE', value: 'Free express shipping on all orders over ₹999 | Use code WELCOME10 for 10% off' },
    ],
  });

  // 4. Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10',
        description: '10% off your entire first order',
        discountType: 'PERCENTAGE',
        value: 10,
        minOrderAmount: 499,
        isActive: true,
      },
      {
        code: 'SAVE500',
        description: '₹500 off premium orders over ₹2,499',
        discountType: 'FIXED',
        value: 500,
        minOrderAmount: 2499,
        isActive: true,
      },
      {
        code: 'FREESHIP',
        description: 'Free standard shipping discount (₹99 off)',
        discountType: 'FIXED',
        value: 99,
        minOrderAmount: 499,
        isActive: true,
      },
    ],
  });

  // 5. Categories
  const categoriesData = [
    {
      name: 'Apparel & Footwear',
      slug: 'apparel-footwear',
      description: 'Timeless basics, heavy-knit outerwear, and engineered daily footwear.',
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Audio & Gadgets',
      slug: 'audio-gadgets',
      description: 'Precision acoustics and minimalist tech built for everyday performance.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Bags & Carry',
      slug: 'bags-carry',
      description: 'Weatherproof transit packs, minimalist slings, and weekend duffels.',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Workspace & Desk',
      slug: 'workspace-desk',
      description: 'Refined tools, mechanical keyboards, and materials to elevate your desk.',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Crafted ceramics, ambient lighting, and artisanal home essentials.',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Stationery & Goods',
      slug: 'stationery-goods',
      description: 'Archival paper, precision-machined brass pens, and tactile notebooks.',
      image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80',
    },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created.id;
  }

  // 6. Products Catalog (24 products with multi-variants & images)
  const productsData = [
    // --- Category: Apparel & Footwear ---
    {
      name: 'Everyday Supima Cotton Tee',
      slug: 'everyday-supima-cotton-tee',
      description: 'Crafted from 100% long-staple American Supima cotton. Exceptionally soft, pre-shrunk, and reinforced with a double-needle collar that maintains its shape wash after wash.',
      shortDescription: 'Heavyweight 220 GSM American Supima cotton crewneck.',
      price: 38.00,
      compareAtPrice: 48.00,
      sku: 'APP-TEE-001',
      categorySlug: 'apparel-footwear',
      featured: true,
      rating: 4.8,
      reviewCount: 42,
      tags: ['Tees', 'Basics', 'Cotton', 'Summer'],
      images: [
        { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80', alt: 'Black Supima Tee front', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80', alt: 'Black Supima Tee fold', isPrimary: false },
      ],
      variants: [
        { title: 'Black / S', sku: 'APP-TEE-001-BLK-S', price: 38.0, stock: 24, options: { Color: 'Black', Size: 'S' } },
        { title: 'Black / M', sku: 'APP-TEE-001-BLK-M', price: 38.0, stock: 45, options: { Color: 'Black', Size: 'M' } },
        { title: 'Black / L', sku: 'APP-TEE-001-BLK-L', price: 38.0, stock: 32, options: { Color: 'Black', Size: 'L' } },
        { title: 'Off-White / M', sku: 'APP-TEE-001-WHT-M', price: 38.0, stock: 18, options: { Color: 'Off-White', Size: 'M' } },
      ],
    },
    {
      name: 'French Terry Relaxed Hoodie',
      slug: 'french-terry-relaxed-hoodie',
      description: 'Cut from 460 GSM unbrushed organic cotton French terry. Designed with dropped shoulders, seamless cuffs, and a structured double-layer hood.',
      shortDescription: '460 GSM heavyweight looped cotton fleece hoodie.',
      price: 110.00,
      compareAtPrice: 135.00,
      sku: 'APP-HD-002',
      categorySlug: 'apparel-footwear',
      featured: true,
      rating: 4.9,
      reviewCount: 37,
      tags: ['Hoodies', 'Fleece', 'Winter', 'Organic'],
      images: [
        { url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80', alt: 'Heather Grey Hoodie', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80', alt: 'Hoodie detail', isPrimary: false },
      ],
      variants: [
        { title: 'Heather Grey / M', sku: 'APP-HD-002-GRY-M', price: 110.0, stock: 14, options: { Color: 'Heather Grey', Size: 'M' } },
        { title: 'Heather Grey / L', sku: 'APP-HD-002-GRY-L', price: 110.0, stock: 22, options: { Color: 'Heather Grey', Size: 'L' } },
        { title: 'Charcoal / M', sku: 'APP-HD-002-CHR-M', price: 110.0, stock: 9, options: { Color: 'Charcoal', Size: 'M' } },
      ],
    },
    {
      name: 'Commuter Knit Zero-Drop Sneakers',
      slug: 'commuter-knit-zero-drop-sneakers',
      description: 'Engineered breathable recycled yarn upper seated on a dual-density bio-based EVA midsole. Wide anatomical toe box with non-slip natural rubber grip.',
      shortDescription: 'Ultra-lightweight barefoot-inspired daily sneakers.',
      price: 145.00,
      compareAtPrice: null,
      sku: 'APP-SNK-003',
      categorySlug: 'apparel-footwear',
      featured: false,
      rating: 4.7,
      reviewCount: 29,
      tags: ['Footwear', 'Sneakers', 'Commute', 'Recycled'],
      images: [
        { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80', alt: 'Commuter Sneaker Red Accent', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80', alt: 'Sneakers pair', isPrimary: false },
      ],
      variants: [
        { title: 'US 9 / Stealth Black', sku: 'APP-SNK-003-9', price: 145.0, stock: 12, options: { Size: 'US 9', Color: 'Stealth Black' } },
        { title: 'US 10 / Stealth Black', sku: 'APP-SNK-003-10', price: 145.0, stock: 16, options: { Size: 'US 10', Color: 'Stealth Black' } },
        { title: 'US 11 / Stealth Black', sku: 'APP-SNK-003-11', price: 145.0, stock: 8, options: { Size: 'US 11', Color: 'Stealth Black' } },
      ],
    },
    {
      name: 'Japanese Selvedge Denim Overshirt',
      slug: 'japanese-selvedge-denim-overshirt',
      description: 'Woven on vintage Toyoda shuttle looms in Kojima, Okayama. 13.5 oz unwashed raw denim that patinas beautifully over years of wear.',
      shortDescription: '13.5 oz vintage loom raw indigo denim jacket.',
      price: 185.00,
      compareAtPrice: 220.00,
      sku: 'APP-JKT-004',
      categorySlug: 'apparel-footwear',
      featured: false,
      rating: 4.9,
      reviewCount: 16,
      tags: ['Denim', 'Japan', 'Jackets', 'Heritage'],
      images: [
        { url: 'https://images.unsplash.com/photo-1601333144130-8cbb312386b6?w=800&auto=format&fit=crop&q=80', alt: 'Selvedge Denim Jacket', isPrimary: true },
      ],
      variants: [
        { title: 'Raw Indigo / S', sku: 'APP-JKT-004-S', price: 185.0, stock: 6, options: { Color: 'Raw Indigo', Size: 'S' } },
        { title: 'Raw Indigo / M', sku: 'APP-JKT-004-M', price: 185.0, stock: 11, options: { Color: 'Raw Indigo', Size: 'M' } },
        { title: 'Raw Indigo / L', sku: 'APP-JKT-004-L', price: 185.0, stock: 4, options: { Color: 'Raw Indigo', Size: 'L' } },
      ],
    },

    // --- Category: Audio & Gadgets ---
    {
      name: 'Apex Studio Wireless ANC Headphones',
      slug: 'apex-studio-wireless-anc-headphones',
      description: 'Equipped with custom 40mm beryllium drivers, hybrid active noise cancellation, and up to 45 hours of high-resolution lossless playback. Memory foam lambskin earcups provide all-day acoustic isolation.',
      shortDescription: 'Flagship beryllium driver ANC over-ear headphones.',
      price: 289.00,
      compareAtPrice: 349.00,
      sku: 'AUD-HP-001',
      categorySlug: 'audio-gadgets',
      featured: true,
      rating: 4.9,
      reviewCount: 64,
      tags: ['Audio', 'Headphones', 'ANC', 'Wireless', 'Hi-Fi'],
      images: [
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', alt: 'Apex Headphones Matte Black', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80', alt: 'Headphones angle', isPrimary: false },
      ],
      variants: [
        { title: 'Matte Obsidian', sku: 'AUD-HP-001-BLK', price: 289.0, stock: 25, options: { Color: 'Matte Obsidian' } },
        { title: 'Silver Aluminium', sku: 'AUD-HP-001-SLV', price: 289.0, stock: 18, options: { Color: 'Silver Aluminium' } },
        { title: 'Warm Sand', sku: 'AUD-HP-001-SND', price: 299.0, stock: 7, options: { Color: 'Warm Sand' } },
      ],
    },
    {
      name: 'Sonosfera Portable Hi-Fi Speaker',
      slug: 'sonosfera-portable-hi-fi-speaker',
      description: 'Solid machined anodized aluminum casing enclosing dual passive radiators and silk dome tweeters. IPX7 waterproof with Bluetooth 5.3 multi-device stereo pairing.',
      shortDescription: '360-degree precision acoustic waterproof speaker.',
      price: 139.00,
      compareAtPrice: null,
      sku: 'AUD-SPK-002',
      categorySlug: 'audio-gadgets',
      featured: true,
      rating: 4.8,
      reviewCount: 48,
      tags: ['Audio', 'Bluetooth', 'Speakers', 'Waterproof'],
      images: [
        { url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80', alt: 'Sonosfera Speaker', isPrimary: true },
      ],
      variants: [
        { title: 'Graphite', sku: 'AUD-SPK-002-GRP', price: 139.0, stock: 20, options: { Color: 'Graphite' } },
        { title: 'Forest Green', sku: 'AUD-SPK-002-GRN', price: 139.0, stock: 15, options: { Color: 'Forest Green' } },
      ],
    },
    {
      name: 'MagGrid 3-in-1 Magnetic Wireless Stand',
      slug: 'maggrid-3-in-1-wireless-stand',
      description: 'Simultaneously fast-charges your phone, smartwatch, and wireless earbuds with 15W Qi2 magnetic alignment. Weighted zinc alloy base prevents tipping.',
      shortDescription: '15W Qi2 weighted magnetic desktop charging dock.',
      price: 89.00,
      compareAtPrice: 109.00,
      sku: 'AUD-CHG-003',
      categorySlug: 'audio-gadgets',
      featured: false,
      rating: 4.6,
      reviewCount: 31,
      tags: ['Charging', 'MagSafe', 'Desk', 'Gadgets'],
      images: [
        { url: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80', alt: 'Wireless Charging Stand', isPrimary: true },
      ],
      variants: [
        { title: 'Midnight Black', sku: 'AUD-CHG-003-BLK', price: 89.0, stock: 35, options: { Color: 'Midnight Black' } },
        { title: 'Alpine White', sku: 'AUD-CHG-003-WHT', price: 89.0, stock: 28, options: { Color: 'Alpine White' } },
      ],
    },
    {
      name: 'AeroBuds Pro Active True Wireless',
      slug: 'aerobuds-pro-active-true-wireless',
      description: '6-microphone beamforming call clarity with adaptive ambient awareness mode. Low latency gaming mode and custom equalizer presets via companion app.',
      shortDescription: 'Compact active noise-cancelling wireless in-ears.',
      price: 159.00,
      compareAtPrice: 189.00,
      sku: 'AUD-EB-004',
      categorySlug: 'audio-gadgets',
      featured: false,
      rating: 4.7,
      reviewCount: 52,
      tags: ['Earbuds', 'Wireless', 'Audio', 'Gym'],
      images: [
        { url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80', alt: 'Wireless Earbuds', isPrimary: true },
      ],
      variants: [
        { title: 'Ceramic White', sku: 'AUD-EB-004-WHT', price: 159.0, stock: 40, options: { Color: 'Ceramic White' } },
        { title: 'Matte Onyx', sku: 'AUD-EB-004-ONX', price: 159.0, stock: 30, options: { Color: 'Matte Onyx' } },
      ],
    },

    // --- Category: Bags & Carry ---
    {
      name: 'Transit Rolltop Weatherproof Backpack (24L)',
      slug: 'transit-rolltop-weatherproof-backpack-24l',
      description: 'Constructed from recycled 840D ballistic nylon with TPU water-repellent laminate. Dedicated suspended 16" laptop sleeve, Fidlock magnetic sternum buckle, and expandable roll-top volume.',
      shortDescription: '24L ballistic nylon waterproof daily transit pack.',
      price: 175.00,
      compareAtPrice: 210.00,
      sku: 'BAG-BP-001',
      categorySlug: 'bags-carry',
      featured: true,
      rating: 4.9,
      reviewCount: 78,
      tags: ['Bags', 'Backpacks', 'Commute', 'Waterproof'],
      images: [
        { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80', alt: 'Transit Backpack Olive', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80', alt: 'Backpack profile', isPrimary: false },
      ],
      variants: [
        { title: 'Tactical Olive / 24L', sku: 'BAG-BP-001-OLV', price: 175.0, stock: 16, options: { Color: 'Tactical Olive', Capacity: '24L' } },
        { title: 'Deep Black / 24L', sku: 'BAG-BP-001-BLK', price: 175.0, stock: 24, options: { Color: 'Deep Black', Capacity: '24L' } },
        { title: 'Slate Grey / 24L', sku: 'BAG-BP-001-GRY', price: 175.0, stock: 12, options: { Color: 'Slate Grey', Capacity: '24L' } },
      ],
    },
    {
      name: 'Nomad Canvas Weekender Duffle (42L)',
      slug: 'nomad-canvas-weekender-duffle-42l',
      description: 'Heavy 18 oz dry-waxed cotton canvas trimmed with full-grain vegetable-tanned Italian leather. YKK Excella brass zippers and padded ergonomic shoulder strap.',
      shortDescription: '42L heritage waxed canvas travel duffle.',
      price: 220.00,
      compareAtPrice: 260.00,
      sku: 'BAG-DUF-002',
      categorySlug: 'bags-carry',
      featured: false,
      rating: 4.8,
      reviewCount: 23,
      tags: ['Travel', 'Duffel', 'Canvas', 'Leather'],
      images: [
        { url: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&auto=format&fit=crop&q=80', alt: 'Canvas Weekender Duffle', isPrimary: true },
      ],
      variants: [
        { title: 'Waxed Tan', sku: 'BAG-DUF-002-TAN', price: 220.0, stock: 9, options: { Color: 'Waxed Tan' } },
        { title: 'Navy / Cognac Leather', sku: 'BAG-DUF-002-NVY', price: 220.0, stock: 14, options: { Color: 'Navy / Cognac' } },
      ],
    },
    {
      name: 'Tech Sling & Cable Folio',
      slug: 'tech-sling-and-cable-folio',
      description: 'Structured compact cross-body sling with accordion interior dividers. Designed to securely organize power banks, SSDs, cables, stylus, and passports.',
      shortDescription: 'Weatherproof tech accessories organizer cross-body sling.',
      price: 65.00,
      compareAtPrice: null,
      sku: 'BAG-SLG-003',
      categorySlug: 'bags-carry',
      featured: false,
      rating: 4.7,
      reviewCount: 45,
      tags: ['EDC', 'Sling', 'Tech', 'Travel'],
      images: [
        { url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80', alt: 'Tech Sling Bag', isPrimary: true },
      ],
      variants: [
        { title: 'Stealth Matte Black', sku: 'BAG-SLG-003-BLK', price: 65.0, stock: 30, options: { Color: 'Stealth Matte Black' } },
      ],
    },

    // --- Category: Workspace & Desk ---
    {
      name: 'Lumina 75% Custom Mechanical Keyboard',
      slug: 'lumina-75-custom-mechanical-keyboard',
      description: 'Gasket-mounted CNC machined 6063 aluminum chassis with sound-dampening IXPE foam. Hot-swappable PCB, south-facing RGB, and factory-lubed linear switches.',
      shortDescription: 'Gasket-mounted CNC aluminum 75% mechanical keyboard.',
      price: 195.00,
      compareAtPrice: 235.00,
      sku: 'DSK-KB-001',
      categorySlug: 'workspace-desk',
      featured: true,
      rating: 5.0,
      reviewCount: 89,
      tags: ['Keyboard', 'Mechanical', 'Desk', 'Workspace'],
      images: [
        { url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80', alt: 'Lumina Mechanical Keyboard', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80', alt: 'Keycaps detail', isPrimary: false },
      ],
      variants: [
        { title: 'Anodized Silver / Linear Switches', sku: 'DSK-KB-001-SLV-LIN', price: 195.0, stock: 15, options: { Finish: 'Anodized Silver', Switch: 'Lubed Linear' } },
        { title: 'Anodized Silver / Tactile Switches', sku: 'DSK-KB-001-SLV-TAC', price: 195.0, stock: 12, options: { Finish: 'Anodized Silver', Switch: 'Lubed Tactile' } },
        { title: 'E-White / Linear Switches', sku: 'DSK-KB-001-WHT-LIN', price: 205.0, stock: 8, options: { Finish: 'E-White', Switch: 'Lubed Linear' } },
      ],
    },
    {
      name: 'Solid American Walnut Desk Mat',
      slug: 'solid-american-walnut-desk-mat',
      description: 'Precision-sliced real American Black Walnut veneer bonded to flexible non-slip natural Portuguese cork backing. Hand-rubbed with organic tung oil.',
      shortDescription: 'Real American walnut & natural cork ergonomic desk pad.',
      price: 79.00,
      compareAtPrice: 95.00,
      sku: 'DSK-MAT-002',
      categorySlug: 'workspace-desk',
      featured: true,
      rating: 4.9,
      reviewCount: 41,
      tags: ['Desk Mat', 'Wood', 'Walnut', 'Minimalist'],
      images: [
        { url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80', alt: 'Walnut Desk Setup', isPrimary: true },
      ],
      variants: [
        { title: 'Medium (31" x 12")', sku: 'DSK-MAT-002-M', price: 79.0, stock: 22, options: { Size: 'Medium (31" x 12")' } },
        { title: 'Large (36" x 18")', sku: 'DSK-MAT-002-L', price: 99.0, stock: 18, options: { Size: 'Large (36" x 18")' } },
      ],
    },
    {
      name: 'Aerodynamic CNC Laptop Stand',
      slug: 'aerodynamic-cnc-laptop-stand',
      description: 'Foldable aircraft-grade aluminum stand engineered to elevate screens to optimal eye level while maximizing laptop cooling airflow.',
      shortDescription: 'Foldable aircraft-grade aluminum ergonomic laptop riser.',
      price: 52.00,
      compareAtPrice: null,
      sku: 'DSK-STD-003',
      categorySlug: 'workspace-desk',
      featured: false,
      rating: 4.7,
      reviewCount: 33,
      tags: ['Laptop', 'Stand', 'Ergonomics', 'Aluminum'],
      images: [
        { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80', alt: 'Laptop Stand', isPrimary: true },
      ],
      variants: [
        { title: 'Space Grey', sku: 'DSK-STD-003-GRY', price: 52.0, stock: 35, options: { Color: 'Space Grey' } },
        { title: 'Silver', sku: 'DSK-STD-003-SLV', price: 52.0, stock: 25, options: { Color: 'Silver' } },
      ],
    },

    // --- Category: Home & Living ---
    {
      name: 'Kanso Ambient Cordless Lamp',
      slug: 'kanso-ambient-cordless-lamp',
      description: 'Rechargeable portable lamp with warm 2200K–2700K step-less touch dimming. Spun copper and matte powder-coated base with 30 hours of runtime on a single charge.',
      shortDescription: 'Portable touch-dimming ambient rechargeable LED lantern.',
      price: 125.00,
      compareAtPrice: 150.00,
      sku: 'HOM-LMP-001',
      categorySlug: 'home-living',
      featured: true,
      rating: 4.9,
      reviewCount: 57,
      tags: ['Lighting', 'Home', 'Lamp', 'Cordless', 'Minimal'],
      images: [
        { url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80', alt: 'Kanso Ambient Lamp', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80', alt: 'Lamp illuminated', isPrimary: false },
      ],
      variants: [
        { title: 'Matte Terracotta', sku: 'HOM-LMP-001-TER', price: 125.0, stock: 14, options: { Color: 'Matte Terracotta' } },
        { title: 'Warm Brass', sku: 'HOM-LMP-001-BRS', price: 135.0, stock: 19, options: { Color: 'Warm Brass' } },
        { title: 'Chalk White', sku: 'HOM-LMP-001-WHT', price: 125.0, stock: 22, options: { Color: 'Chalk White' } },
      ],
    },
    {
      name: 'Artisanal Ceramic Pour-Over Kettle (0.9L)',
      slug: 'artisanal-ceramic-pour-over-kettle-0-9l',
      description: 'Gooseneck spout engineered for counterbalanced laminar water flow control. Built-in analog lid thermometer and stay-cool natural walnut handle.',
      shortDescription: 'Precision flow gooseneck kettle with real walnut handle.',
      price: 84.00,
      compareAtPrice: null,
      sku: 'HOM-KTL-002',
      categorySlug: 'home-living',
      featured: false,
      rating: 4.8,
      reviewCount: 39,
      tags: ['Coffee', 'Kitchen', 'Kettle', 'Ceramic'],
      images: [
        { url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80', alt: 'Ceramic Pour Over Kettle', isPrimary: true },
      ],
      variants: [
        { title: 'Matte Slate', sku: 'HOM-KTL-002-SLT', price: 84.0, stock: 16, options: { Color: 'Matte Slate' } },
        { title: 'Sand Ceramic', sku: 'HOM-KTL-002-SND', price: 84.0, stock: 11, options: { Color: 'Sand Ceramic' } },
      ],
    },
    {
      name: 'Stoneware Minimal Dinner Plates (Set of 4)',
      slug: 'stoneware-minimal-dinner-plates-set-of-4',
      description: 'Hand-thrown durable stoneware with a semi-matte satin reactive glaze. Microwave, oven, and dishwasher safe with lip rim detail.',
      shortDescription: 'Set of 4 artisan-crafted durable stoneware dinner plates.',
      price: 68.00,
      compareAtPrice: 85.00,
      sku: 'HOM-PLT-003',
      categorySlug: 'home-living',
      featured: false,
      rating: 4.7,
      reviewCount: 28,
      tags: ['Dining', 'Ceramics', 'Kitchen', 'Stoneware'],
      images: [
        { url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&auto=format&fit=crop&q=80', alt: 'Stoneware Plates Set', isPrimary: true },
      ],
      variants: [
        { title: 'Speckled Oat', sku: 'HOM-PLT-003-OAT', price: 68.0, stock: 20, options: { Color: 'Speckled Oat' } },
        { title: 'Charcoal Matte', sku: 'HOM-PLT-003-CHR', price: 68.0, stock: 15, options: { Color: 'Charcoal Matte' } },
      ],
    },
    {
      name: 'Botanical Hinoki & Cedar Soy Candle',
      slug: 'botanical-hinoki-and-cedar-soy-candle',
      description: 'Hand-poured 100% natural soy wax infused with wild Japanese Hinoki wood, smoked cedar, and crushed vetiver root. 60-hour clean burn time with a crackling wooden wick.',
      shortDescription: 'Japanese hinoki and cedarwood hand-poured soy candle.',
      price: 36.00,
      compareAtPrice: null,
      sku: 'HOM-CND-004',
      categorySlug: 'home-living',
      featured: false,
      rating: 4.9,
      reviewCount: 61,
      tags: ['Candle', 'Fragrance', 'Home', 'Relax'],
      images: [
        { url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop&q=80', alt: 'Botanical Candle', isPrimary: true },
      ],
      variants: [
        { title: 'Hinoki & Cedar / 10 oz', sku: 'HOM-CND-004-HNK', price: 36.0, stock: 45, options: { Scent: 'Hinoki & Cedar', Size: '10 oz' } },
      ],
    },

    // --- Category: Stationery & Goods ---
    {
      name: 'Heirloom Solid Machined Brass Pen',
      slug: 'heirloom-solid-machined-brass-pen',
      description: 'Precision lathe-turned from solid raw brass stock. Perfectly balanced center of gravity, accepts standard Schmidt P900 or Parker G2 refills. Develops an extraordinary personal patina.',
      shortDescription: 'Lathe-machined solid brass heavyweight rollerball pen.',
      price: 58.00,
      compareAtPrice: 70.00,
      sku: 'STN-PEN-001',
      categorySlug: 'stationery-goods',
      featured: true,
      rating: 5.0,
      reviewCount: 46,
      tags: ['Pen', 'Brass', 'Stationery', 'EDC', 'Heirloom'],
      images: [
        { url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80', alt: 'Brass Pen on Notebook', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1585336261026-77cc7c289066?w=800&auto=format&fit=crop&q=80', alt: 'Pen tip close up', isPrimary: false },
      ],
      variants: [
        { title: 'Raw Polished Brass', sku: 'STN-PEN-001-RAW', price: 58.0, stock: 25, options: { Finish: 'Raw Polished Brass' } },
        { title: 'Aged Black PVD', sku: 'STN-PEN-001-PVD', price: 68.0, stock: 14, options: { Finish: 'Aged Black PVD' } },
      ],
    },
    {
      name: 'Archival Thread-Bound Grid Journal',
      slug: 'archival-thread-bound-grid-journal',
      description: '192 numbered pages of fountain pen-friendly 100 GSM acid-free Japanese Tomoe River-style paper. Smyth-sewn lay-flat binding with dual silk page markers.',
      shortDescription: 'Lay-flat thread-bound 100 GSM acid-free dot grid notebook.',
      price: 28.00,
      compareAtPrice: 34.00,
      sku: 'STN-JRN-002',
      categorySlug: 'stationery-goods',
      featured: false,
      rating: 4.9,
      reviewCount: 38,
      tags: ['Notebook', 'Journal', 'Paper', 'Grid'],
      images: [
        { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80', alt: 'Hardcover Journal', isPrimary: true },
      ],
      variants: [
        { title: 'Forest Moss / Dot Grid', sku: 'STN-JRN-002-MOS', price: 28.0, stock: 32, options: { Color: 'Forest Moss', Ruling: 'Dot Grid' } },
        { title: 'Midnight Navy / Dot Grid', sku: 'STN-JRN-002-NVY', price: 28.0, stock: 24, options: { Color: 'Midnight Navy', Ruling: 'Dot Grid' } },
        { title: 'Warm Charcoal / Lined', sku: 'STN-JRN-002-CHR', price: 28.0, stock: 19, options: { Color: 'Warm Charcoal', Ruling: 'Lined' } },
      ],
    },
    {
      name: 'Vacuum Insulated Stainless Steel Bottle (750ml)',
      slug: 'vacuum-insulated-stainless-steel-bottle-750ml',
      description: 'Double-wall 18/8 pro-grade stainless steel with copper vacuum insulation. Keeps ice-cold for 24 hours or piping hot for 12 hours. Leakproof silicone-sealed steel cap.',
      shortDescription: '750ml double-wall copper vacuum thermal water bottle.',
      price: 42.00,
      compareAtPrice: null,
      sku: 'STN-BTL-003',
      categorySlug: 'stationery-goods',
      featured: false,
      rating: 4.8,
      reviewCount: 50,
      tags: ['Bottle', 'Hydration', 'Stainless', 'Outdoor'],
      images: [
        { url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80', alt: 'Insulated Bottle', isPrimary: true },
      ],
      variants: [
        { title: 'Matte Desert Sand / 750ml', sku: 'STN-BTL-003-SND', price: 42.0, stock: 28, options: { Color: 'Matte Desert Sand', Capacity: '750ml' } },
        { title: 'Deep Obsidian / 750ml', sku: 'STN-BTL-003-BLK', price: 42.0, stock: 34, options: { Color: 'Deep Obsidian', Capacity: '750ml' } },
      ],
    },
  ];

  for (const p of productsData) {
    const categoryId = categories[p.categorySlug];
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        shortDescription: p.shortDescription,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        sku: p.sku,
        categoryId,
        status: 'PUBLISHED',
        tags: JSON.stringify(p.tags),
        featured: p.featured,
        rating: p.rating,
        reviewCount: p.reviewCount,
      },
    });

    // Add Images
    for (let i = 0; i < p.images.length; i++) {
      const img = p.images[i];
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: img.url,
          alt: img.alt,
          position: i,
          isPrimary: img.isPrimary,
        },
      });
    }

    // Add Variants & Inventory
    for (const v of p.variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          title: v.title,
          sku: v.sku,
          price: v.price,
          compareAtPrice: p.compareAtPrice,
          stock: v.stock,
          options: JSON.stringify(v.options),
        },
      });

      await prisma.inventory.create({
        data: {
          productId: product.id,
          variantId: variant.id,
          sku: v.sku,
          quantity: v.stock,
          lowStockThreshold: 5,
          trackQuantity: true,
        },
      });
    }

    // Add a couple of realistic reviews for social proof
    await prisma.productReview.createMany({
      data: [
        {
          productId: product.id,
          authorName: 'David K.',
          authorEmail: 'david@example.com',
          rating: 5,
          title: 'Unbelievable attention to detail',
          comment: `Exceeded all expectations. The tactile feel and build quality of this ${p.name.toLowerCase()} are phenomenal. Arrived within 2 days!`,
          isApproved: true,
        },
        {
          productId: product.id,
          authorName: 'Claire B.',
          authorEmail: 'claire@example.com',
          rating: p.rating >= 4.8 ? 5 : 4,
          title: 'Daily favorite',
          comment: 'Such a clean minimalist aesthetic. It works seamlessly and fits perfectly in my daily rotation.',
          isApproved: true,
        },
      ],
    });
  }

  // 7. Seed Demo Past Orders for rich Admin Analytics & Customer History
  const sampleProducts = await prisma.product.findMany({
    take: 6,
    include: { variants: true, images: true },
  });

  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-8941',
      userId: customer1.id,
      customerName: 'Marcus Chen',
      customerEmail: 'customer@ecommerce.test',
      customerPhone: '+1 (555) 876-5432',
      subtotal: 289.00,
      discount: 28.90,
      shipping: 0.00,
      total: 260.10,
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      paymentMethod: 'DEMO_CARD',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    },
  });

  if (sampleProducts[0]) {
    await prisma.orderItem.create({
      data: {
        orderId: order1.id,
        productId: sampleProducts[0].id,
        variantId: sampleProducts[0].variants[0]?.id,
        title: sampleProducts[0].name,
        variantTitle: sampleProducts[0].variants[0]?.title || 'Standard',
        sku: sampleProducts[0].sku,
        price: sampleProducts[0].price,
        quantity: 1,
        total: sampleProducts[0].price,
        image: sampleProducts[0].images[0]?.url,
      },
    });
  }

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-9214',
      userId: customer2.id,
      customerName: 'Sophia Rodriguez',
      customerEmail: 'sophia@example.com',
      customerPhone: '+1 (555) 432-1098',
      subtotal: 195.00,
      discount: 0.00,
      shipping: 8.50,
      total: 203.50,
      status: 'SHIPPED',
      paymentStatus: 'PAID',
      paymentMethod: 'DEMO_UPI',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    },
  });

  if (sampleProducts[1]) {
    await prisma.orderItem.create({
      data: {
        orderId: order2.id,
        productId: sampleProducts[1].id,
        variantId: sampleProducts[1].variants[0]?.id,
        title: sampleProducts[1].name,
        variantTitle: sampleProducts[1].variants[0]?.title || 'Standard',
        sku: sampleProducts[1].sku,
        price: sampleProducts[1].price,
        quantity: 1,
        total: sampleProducts[1].price,
        image: sampleProducts[1].images[0]?.url,
      },
    });
  }

  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-9482',
      userId: customer1.id,
      customerName: 'Marcus Chen',
      customerEmail: 'customer@ecommerce.test',
      customerPhone: '+1 (555) 876-5432',
      subtotal: 148.00,
      discount: 20.00,
      shipping: 0.00,
      total: 128.00,
      status: 'PROCESSING',
      paymentStatus: 'PAID',
      paymentMethod: 'DEMO_CARD',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    },
  });

  if (sampleProducts[2]) {
    await prisma.orderItem.create({
      data: {
        orderId: order3.id,
        productId: sampleProducts[2].id,
        variantId: sampleProducts[2].variants[0]?.id,
        title: sampleProducts[2].name,
        variantTitle: sampleProducts[2].variants[0]?.title || 'Standard',
        sku: sampleProducts[2].sku,
        price: sampleProducts[2].price,
        quantity: 1,
        total: sampleProducts[2].price,
        image: sampleProducts[2].images[0]?.url,
      },
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log(`- Categories: ${categoriesData.length}`);
  console.log(`- Products: ${productsData.length}`);
  console.log('- Demo Admin: admin@ecommerce.test / Admin@123');
  console.log('- Demo Customer: customer@ecommerce.test / Customer@123');
  console.log('- Coupons: WELCOME10 (10% off), SAVE20 ($20 off), FREESHIP ($8.50 off)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
