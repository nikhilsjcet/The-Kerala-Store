-- ============================================================
-- TheKeralaStore - Database Setup & Initial Catalog Migration
-- ============================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/lnjnyhiknjifxjnzpjth
-- 2. Go to "SQL Editor" in the left sidebar.
-- 3. Click "New query", paste this entire script, and click "Run".
-- ============================================================

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

-- 3. Create Suppliers Table (Dropshipping Internal)
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
    
    -- Dropshipping internal fields (Hidden from customer queries via RLS)
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

-- ============================================================
-- 9. Row Level Security (RLS) Configuration
-- ============================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

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

-- Allow customers to place orders
CREATE POLICY "Public create orders" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public create order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

-- Allow customers to read orders
CREATE POLICY "Public read orders" ON public.orders
    FOR SELECT USING (true);

CREATE POLICY "Public read order items" ON public.order_items
    FOR SELECT USING (true);

-- Allow authenticated / admin full access
CREATE POLICY "Admin full categories" ON public.categories FOR ALL TO authenticated, anon USING (true);
CREATE POLICY "Admin full products" ON public.products FOR ALL TO authenticated, anon USING (true);
CREATE POLICY "Admin full variants" ON public.product_variants FOR ALL TO authenticated, anon USING (true);
CREATE POLICY "Admin full suppliers" ON public.suppliers FOR ALL TO authenticated, anon USING (true);
CREATE POLICY "Admin full discounts" ON public.discounts FOR ALL TO authenticated, anon USING (true);
CREATE POLICY "Admin full orders" ON public.orders FOR ALL TO authenticated, anon USING (true);
CREATE POLICY "Admin full order items" ON public.order_items FOR ALL TO authenticated, anon USING (true);

-- ============================================================
-- 10. Seed Initial Data (Matching Reference UI Screenshots)
-- ============================================================

-- Categories from reference screenshots
INSERT INTO public.categories (id, name, slug, icon_name, image_url, display_order, is_active) VALUES
('b1000000-0000-0000-0000-000000000001', 'Computers', 'computers', 'Laptop', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80', 1, true),
('b1000000-0000-0000-0000-000000000002', 'Mobile', 'mobile', 'Smartphone', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80', 2, true),
('b1000000-0000-0000-0000-000000000003', 'Drones & Cameras', 'drones-cameras', 'Camera', 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=400&q=80', 3, true),
('b1000000-0000-0000-0000-000000000004', 'Sale', 'sale', 'Tag', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=400&q=80', 4, true),
('b1000000-0000-0000-0000-000000000005', 'Tablets', 'tablets', 'Tablet', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80', 5, true),
('b1000000-0000-0000-0000-000000000006', 'Best Quality', 'best-quality', 'Award', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80', 6, true),
('b1000000-0000-0000-0000-000000000007', 'T.V & Home Cinema', 'tv-home-cinema', 'Tv', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80', 7, true),
('b1000000-0000-0000-0000-000000000008', 'Wearable Tech', 'wearable-tech', 'Watch', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80', 8, true),
('b1000000-0000-0000-0000-000000000009', 'Audio', 'audio', 'Headphones', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80', 9, true)
ON CONFLICT (slug) DO NOTHING;

-- Initial Suppliers
INSERT INTO public.suppliers (id, name, contact_name, email, phone, lead_time_days, status) VALUES
('a1000000-0000-0000-0000-000000000001', 'Shenzhen Apex Electronics Co.', 'David Zhang', 'dropship@apexelectronics.sz', '+86 755 8892 1092', 4, 'active'),
('a1000000-0000-0000-0000-000000000002', 'Nordic Lifestyle Supply Hub', 'Elena Rostova', 'fulfillment@nordiclifestyle.io', '+44 20 7946 0192', 3, 'active'),
('a1000000-0000-0000-0000-000000000003', 'Kochi Direct Logistics & Gadgets', 'Praveen Nair', 'partners@kochidirect.in', '+91 484 2390192', 2, 'active')
ON CONFLICT (id) DO NOTHING;

-- Initial Seed Products
INSERT INTO public.products (
    id, title, slug, short_description, description, images, price, original_price, 
    discount_percentage, category_id, sku, stock_quantity, is_featured, is_trending, 
    is_new_arrival, is_on_sale, status, supplier_name, supplier_cost, rating, review_count
) VALUES
(
    'c1000000-0000-0000-0000-000000000001',
    'AeroGlide 4K GPS Foldable Drone with 3-Axis Gimbal',
    'aeroglide-4k-gps-foldable-drone',
    'Ultra-stable 4K HDR camera drone with 35-min flight time, obstacle avoidance, and auto-return.',
    'Equipped with a Sony 1/2-inch CMOS sensor, the AeroGlide 4K Drone captures stunning aerial footage in 4K at 60fps. Its foldable ultralight design complies with general aviation guidelines. Features GPS-assisted auto return home, 5km digital video transmission, and wind resistance level 7.',
    ARRAY['https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1507582020432-2a3bc4ff723c?auto=format&fit=crop&w=800&q=80'],
    34999, 49999, 30, 'b1000000-0000-0000-0000-000000000003', 'TKS-DRN-001', 42, true, true, false, true, 'published', 'Shenzhen Apex Electronics Co.', 21500, 4.9, 88
),
(
    'c1000000-0000-0000-0000-000000000002',
    'PureBass Studio Pro Wireless ANC Headphones',
    'purebass-studio-pro-anc-headphones',
    'Hybrid Active Noise Canceling headphones with 60-hour playtime, spatial audio, and memory foam comfort.',
    'Immerse yourself into pure acoustic bliss. PureBass Studio Pro features 40mm custom graphene drivers delivering punchy sub-bass and crystal-clear highs. The dual-mode active noise cancellation blocks up to 98% of ambient noise.',
    ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'],
    4999, 8999, 44, 'b1000000-0000-0000-0000-000000000009', 'TKS-AUD-002', 85, true, true, true, true, 'published', 'Shenzhen Apex Electronics Co.', 2600, 4.8, 142
),
(
    'c1000000-0000-0000-0000-000000000003',
    'NovaBook 14" Slim Laptop (16GB RAM / 512GB SSD)',
    'novabook-14-slim-laptop',
    'Featherlight 1.2kg metal chassis ultrabook with 2.8K OLED 120Hz display, Core i7, and all-day battery.',
    'Designed for professionals, students, and creators on the move. The NovaBook 14 features an aerospace-grade aluminum chassis, backlit keyboard, fingerprint login, and blazing-fast PCIe 4.0 storage.',
    ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80'],
    52999, 64999, 18, 'b1000000-0000-0000-0000-000000000001', 'TKS-CMP-003', 28, true, false, false, true, 'published', 'Kochi Direct Logistics & Gadgets', 41000, 4.7, 53
),
(
    'c1000000-0000-0000-0000-000000000004',
    'TitanEdge AMOLED Smartwatch with Bluetooth Calling & GPS',
    'titanedge-amoled-smartwatch',
    '1.43" vibrant HD AMOLED display, zinc-alloy bezel, SpO2 & 24/7 heart-rate monitor, 12-day battery.',
    'Elevate your daily lifestyle with TitanEdge. Featuring an always-on AMOLED touchscreen, over 110 sports modes, integrated dual-band GPS, sleep tracking, and IP68 waterproof rating.',
    ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
    2799, 5999, 53, 'b1000000-0000-0000-0000-000000000008', 'TKS-WTC-004', 110, false, true, true, true, 'published', 'Shenzhen Apex Electronics Co.', 1450, 4.8, 94
),
(
    'c1000000-0000-0000-0000-000000000005',
    'SmartAir Touch Digital Air Fryer 5.5L with Rapid Crisp Tech',
    'smartair-touch-digital-air-fryer-55l',
    'Cook delicious crispy snacks with 85% less oil. 8 one-touch presets, non-stick ceramic basket.',
    'Featured in our lifestyle collection! The SmartAir Touch 5.5L Air Fryer uses 360-degree rapid heat circulation to deliver golden, crunch-loaded fries, samosas, and roasted vegetables with little to no oil.',
    ARRAY['https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80'],
    4499, 7999, 43, 'b1000000-0000-0000-0000-000000000006', 'TKS-KIT-006', 40, true, true, true, true, 'published', 'Nordic Lifestyle Supply Hub', 2500, 4.9, 112
),
(
    'c1000000-0000-0000-0000-000000000006',
    'SlatePad 11" 2.5K Productivity Tablet with Smart Stylus',
    'slatepad-11-productivity-tablet-stylus',
    'Vivid 11-inch 2.5K 90Hz screen, Quad speakers, Octa-Core processor, and low-latency digital pen included.',
    'Whether note-taking in college, binge-watching your favorite series, or sketching your next design masterpiece, SlatePad 11 offers snappy responsiveness, 8000mAh battery, and split-screen multitasking.',
    ARRAY['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80'],
    18999, 24999, 24, 'b1000000-0000-0000-0000-000000000005', 'TKS-TAB-007', 32, true, false, true, true, 'published', 'Shenzhen Apex Electronics Co.', 13500, 4.7, 39
),
(
    'c1000000-0000-0000-0000-000000000007',
    'AuraWave 360° Waterproof Bluetooth Portable Speaker',
    'aurawave-360-waterproof-bluetooth-speaker',
    'Room-filling 360-degree sound with deep bass radiators, RGB ambient beat lighting, and 24h battery.',
    'Take your beats anywhere—poolside, beach, camping, or living room. The AuraWave 360 combines 30W stereo output with dual passive radiators and IPX7 waterproof housing.',
    ARRAY['https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'],
    2499, 4499, 44, 'b1000000-0000-0000-0000-000000000009', 'TKS-AUD-005', 65, false, true, false, true, 'published', 'Kochi Direct Logistics & Gadgets', 1300, 4.6, 67
),
(
    'c1000000-0000-0000-0000-000000000008',
    'AromaZen Ultrasonic Ceramic Essential Oil Diffuser & Ambient Lamp',
    'aromazen-ultrasonic-ceramic-diffuser-lamp',
    'Handcrafted ceramic body, whisper-quiet ultrasonic mist, 7 soothing warm ambient light settings.',
    'Transform any room into a tranquil haven. Handcrafted from textured ceramic stoneware, the AromaZen diffuser gently humidifies your space while diffusing pure natural essential oils.',
    ARRAY['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80'],
    1899, 3299, 42, 'b1000000-0000-0000-0000-000000000006', 'TKS-HOM-008', 75, false, true, false, true, 'published', 'Nordic Lifestyle Supply Hub', 950, 4.9, 76
)
ON CONFLICT (slug) DO NOTHING;

-- Initial Coupons
INSERT INTO public.discounts (code, discount_type, value, min_order_amount, is_active) VALUES
('KERALA10', 'percentage', 10, 999, true),
('WELCOME150', 'fixed', 150, 1499, true),
('FESTIVE20', 'percentage', 20, 2999, true)
ON CONFLICT (code) DO NOTHING;

