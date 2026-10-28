# TheKeralaStore - Modern Dropshipping E-Commerce Platform

A complete, responsive dropshipping platform built with **React, TypeScript, Vite, Tailwind CSS, Supabase PostgreSQL, and Razorpay**.

Designed using the reference UI visual hierarchy and styled with Kerala's signature lush deep forest green (`#0A5C36`), warm off-white tones, refined shadows, and bold modern accents.

---

## 🚀 Key Features

### 1. Storefront Experience (Matching Reference Screenshots)
- **Announcement Bar**: Deep green `#0A5C36` top bar with free shipping threshold (`₹999`) and contact links.
- **Header & Navigation**: `@thekeralastore` emblem, live real-time product search with thumbnail preview, wishlist counter, shopping cart drawer, and user profile role switcher.
- **Category Sub-bar**: Soft sage mint bar with horizontal departments (`Computers`, `Tablets`, `Drones & Cameras`, `Audio`, `Mobile`, `T.V & Home Cinema`, `Wearable Tech`, `Sale`).
- **Hero Banner**: Curated lifestyle dropship goods showcase with `"Best Prices"` badge, `@thekeralastore` branding, and `"Shop Now"` blue CTA button.
- **Promotional Dual Banner**: High-impact `"Holiday Deals - Up to 30% off"` (Smartphones) and `"Just In - Take Your Sound"` (ANC Headphones).
- **Shop by Category**: Circular department cards with high-res product icons and special purple `"Sale"` badge.
- **Big Promo Section**: Split banner with overlapping `"Best Price"` pink circle badge and `"Save up to ₹12,000 on laptop & tablets"`.
- **Dynamic Collections**: Trending Picks, Best Sellers in India, and New Arrivals.
- **Store Footer**: 4-column layout (`Store Location`, `Shop`, `Customer Support`, `Policy`) followed by accepted payment methods badges (Visa, Mastercard, Amex, UPI, RuPay, PayPal, Razorpay).

### 2. Catalog & Dynamic Product Management
- Selling prices in INR (`₹`) with original prices and auto-calculated discount percentages.
- Multi-variant selector (Storage, Color, Size) with dynamic price adjustment.
- Indian 6-digit PIN code delivery estimator with expected transit calculation.
- Tabbed Description, Technical Specifications, and Customer Reviews.
- Slide-over Cart drawer with Free Shipping progress bar (`Add ₹... more for Free Shipping`).

### 3. Doorstep Indian Checkout & Payments
- Validated Indian address form (PIN code, all 28 States & UTs, 10-digit mobile number).
- Multiple payment options:
  - **Cash on Delivery (COD)** with zero extra fee.
  - **Razorpay Online Payments** (UPI - GPay/PhonePe/Paytm, RuPay, Visa, Mastercard, NetBanking).
- Server-side price recalculation: Browser cart prices are recalculated on checkout.
- Order Confirmation & Live Tracking Stepper (`Confirmed` &rarr; `Supplier Prepared` &rarr; `Shipped` &rarr; `Delivered`) with Carrier Tracking Numbers (BlueDart, Delhivery).

### 4. Protected Admin Dashboard (`/admin`)
- **Overview & Profit Analytics**: Real-time sales revenue, completed orders, and estimated net profit (Revenue minus supplier cost).
- **Products**: Add, edit, delete, archive, publish/unpublish products with instant storefront reactivity.
- **Dropshipping Features**: Internal supplier cost, supplier portal URL, supplier SKU, processing lead time, and supplier order reference.
- **Categories**: Dynamic category creator and slug manager.
- **Fulfillment & Dispatch**: Assign carrier tracking numbers and update delivery statuses.
- **Discounts**: Create coupon codes (`KERALA10`, `WELCOME150`).
- **Framer Public API Documentation**: Clean headless API endpoints for embedding in external Framer sites.

### 5. Supabase Integration & RLS Security
- Database schema provided with proper primary keys, foreign keys, constraints, and timestamps.
- **Row Level Security (RLS)**:
  - Public shoppers may only read active categories, published products, and active discounts.
  - Internal wholesale supplier costs and private tracking references are protected.
  - Admin access restricted to authorized administrators.
- In-app **Supabase Integration Manager** for 1-click SQL schema copying and connection verification.

---

## 🛠️ Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **Backend / Database**: Supabase PostgreSQL + Row Level Security
- **Payments**: Razorpay Indian Payment Gateway & Cash on Delivery

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```
*(Note: If you run the project without credentials initially, it runs automatically on a resilient, fully interactive local state with persistent mock data, and you can connect Supabase anytime directly through the in-app modal!)*

### 3. Initialize Supabase Database
1. Open your Supabase Dashboard &gt; **SQL Editor**.
2. Click **New Query** and paste the contents of `src/lib/supabaseSchema.sql` (or copy it directly from the in-app **Supabase Integration Manager**).
3. Click **Run**.
4. In Supabase Dashboard &gt; **Storage**, create a new public bucket named `product-images`.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
```
Generates a minified, optimized production bundle inside the `dist/` directory.

---

## 🎨 Brand Tokens
- **Primary Brand Green**: `#0A5C36`
- **Sub-nav Sage / Mint**: `#EBF5EE`
- **Warm Background**: `#FBFBFA`
- **Promo Badge Pink**: `#FF3B80`
- **Action Button Blue**: `#1D4ED8`

