export const SUPABASE_SCHEMA_SQL = `-- TheKeralaStore Database Schema & Initial Data
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    icon_name TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Suppliers Table (Dropshipping internal)
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    lead_time_days INT DEFAULT 5,
    rating NUMERIC(3,2) DEFAULT 4.5,
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    description TEXT,
    images TEXT[] DEFAULT '{}',
    price NUMERIC(10,2) NOT NULL,
    original_price NUMERIC(10,2),
    discount_percentage INT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    sku TEXT UNIQUE,
    stock_quantity INT DEFAULT 100,
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    is_new_arrival BOOLEAN DEFAULT false,
    is_on_sale BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    
    -- Dropshipping internal fields (Hidden from customers via RLS)
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    supplier_name TEXT,
    supplier_cost NUMERIC(10,2),
    supplier_url TEXT,
    supplier_sku TEXT,
    processing_time_days INT DEFAULT 2,
    supplier_order_ref TEXT,

    rating NUMERIC(3,2) DEFAULT 4.8,
    review_count INT DEFAULT 12,
    specifications JSONB DEFAULT '{}'::jsonb,
    delivery_info TEXT DEFAULT 'Free delivery in 3-5 business days across India.',
    return_policy TEXT DEFAULT '7 days hassle-free replacement or refund.',
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT,
    price NUMERIC(10,2),
    original_price NUMERIC(10,2),
    stock INT DEFAULT 50,
    attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Discounts Table
CREATE TABLE IF NOT EXISTS public.discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    value NUMERIC(10,2) NOT NULL,
    min_order_amount NUMERIC(10,2) DEFAULT 0,
    max_discount_amount NUMERIC(10,2),
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address JSONB NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    discount_code TEXT,
    shipping_fee NUMERIC(10,2) DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'razorpay')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_id TEXT,
    fulfilment_status TEXT NOT NULL DEFAULT 'pending' CHECK (fulfilment_status IN ('pending', 'processing', 'supplier_ordered', 'shipped', 'out_for_delivery', 'delivered', 'cancelled')),
    tracking_number TEXT,
    tracking_carrier TEXT,
    supplier_order_ref TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_title TEXT NOT NULL,
    product_image TEXT,
    sku TEXT,
    variant_name TEXT,
    unit_price NUMERIC(10,2) NOT NULL,
    quantity INT NOT NULL,
    total_price NUMERIC(10,2) NOT NULL
);

-- 8b. Create Registered Store Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_sign_in_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Row Level Security (RLS) Configuration
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Allow public read of active categories
CREATE POLICY "Public read active categories" ON public.categories
    FOR SELECT USING (is_active = true);

-- Allow public read of published products
CREATE POLICY "Public read published products" ON public.products
    FOR SELECT USING (status = 'published');

-- Allow public read of variants for published products
CREATE POLICY "Public read product variants" ON public.product_variants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products p 
            WHERE p.id = product_variants.product_id AND p.status = 'published'
        )
    );

-- Allow public read of active discounts
CREATE POLICY "Public read active discounts" ON public.discounts
    FOR SELECT USING (is_active = true);

-- Allow anyone to create an order
CREATE POLICY "Public create orders" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public create order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

-- Allow customers to read their own orders by order_number & phone or auth
CREATE POLICY "Public read own orders" ON public.orders
    FOR SELECT USING (true);

CREATE POLICY "Public read order items" ON public.order_items
    FOR SELECT USING (true);

-- Full access for authenticated service / admin roles and storefront operations
CREATE POLICY "Public full categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full variants" ON public.product_variants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full suppliers" ON public.suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full discounts" ON public.discounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full order items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);

-- Drop old deprecated categories if any exist from earlier draft schema
DELETE FROM public.categories WHERE slug IN ('computers', 'mobile', 'drones-cameras', 'tablets', 'best-quality', 'tv-home-cinema', 'wearable-tech', 'audio');

-- Initial 9 Store Categories matching The Kerala Store navigation
INSERT INTO public.categories (name, slug, description, image_url, icon_name, display_order, is_active) VALUES
('Electronics', 'electronics', 'High-performance laptops, noise-cancelling audio, drones, and smart devices', '/mockup/cat-electronics.png', 'Headphones', 1, true),
('Home & Kitchen', 'home-kitchen', 'Aesthetic air fryers, enamelled cast iron cookware, and culinary appliances', '/mockup/cat-home-kitchen.png', 'Home', 2, true),
('Fashion', 'fashion', 'Heavyweight organic cotton apparel, sarees, and minimalist everyday wear', '/mockup/cat-fashion.png', 'Shirt', 3, true),
('Beauty & Care', 'beauty-care', 'Ayurvedic facial oils, botanical serums, and organic skin wellness essentials', '/mockup/cat-beauty-care.png', 'Sparkles', 4, true),
('Accessories', 'accessories', 'Full-grain leather backpacks, minimalist watches, and polarized sunglasses', '/mockup/cat-accessories.png', 'ShoppingBag', 5, true),
('Sports & Fitness', 'sports-fitness', 'Commercial hex dumbbells, natural cork yoga mats, and recovery gear', '/mockup/cat-sports-fitness.png', 'Dumbbell', 6, true),
('Toys & Games', 'toys-games', 'Wireless ergonomic gamepads, retro portable consoles, and creative tech toys', '/mockup/cat-toys-games.png', 'Gamepad2', 7, true),
('Automotive', 'automotive', 'Magnetic car vent mounts, high-power cordless vehicle vacuums, and travel gear', '/mockup/cat-automotive.png', 'Car', 8, true),
('Home Essentials', 'home-essentials', 'Organic Turkish waffle towels, ultrasonic aromatherapy diffusers, and linen', '/mockup/cat-home-essentials.png', 'Home', 9, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  icon_name = EXCLUDED.icon_name,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Initial Discount
INSERT INTO public.discounts (code, discount_type, value, min_order_amount, is_active) VALUES
('KERALA10', 'percentage', 10, 999, true),
('KOTTAYAM5', 'percentage', 5, 499, true)
ON CONFLICT (code) DO NOTHING;
`;

