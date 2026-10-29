import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { 
  Category, 
  Product, 
  Supplier, 
  DiscountCode, 
  Order, 
  FulfilmentStatus, 
  PaymentStatus,
  RegisteredCustomer
} from '../types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCTS, 
  INITIAL_SUPPLIERS, 
  INITIAL_DISCOUNTS 
} from './seedData';

// Storage keys for local fallback
const STORAGE_KEYS = {
  CATEGORIES: 'tks_categories_v2',
  PRODUCTS: 'tks_products_v2',
  SUPPLIERS: 'tks_suppliers_v2',
  DISCOUNTS: 'tks_discounts_v2',
  ORDERS: 'tks_orders_v2',
  CUSTOMERS: 'tks_registered_customers_v2',
};

export function isValidUUID(str: any): boolean {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
}

// Helpers for localStorage fallback
function getLocal<T>(key: string, initialData: T): T {
  if (typeof window === 'undefined') return initialData;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return initialData;
  }
}

function setLocal<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

export class StoreService {
  // Test connection to Supabase
  static async testSupabase(): Promise<{ ok: boolean; message: string; count?: number }> {
    if (!isSupabaseConfigured()) {
      return { ok: false, message: 'Supabase URL or Anon Key is missing.' };
    }
    const client = getSupabaseClient();
    if (!client) {
      return { ok: false, message: 'Could not create Supabase client instance.' };
    }

    try {
      const { data, error, count } = await client
        .from('categories')
        .select('*', { count: 'exact', head: true });

      if (error) {
        // Table might not exist yet
        return { 
          ok: false, 
          message: `Connected to Supabase, but encountered error (table may need creation): ${error.message}` 
        };
      }
      return { ok: true, message: 'Successfully connected to Supabase!', count: count ?? 0 };
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Network error connecting to Supabase.' };
    }
  }

  // --- CATEGORIES ---
  static async syncDefaultCategories(): Promise<Category[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          for (const cat of INITIAL_CATEGORIES) {
            await client.from('categories').upsert({
              name: cat.name,
              slug: cat.slug,
              description: cat.description,
              image_url: cat.image_url,
              icon_name: cat.icon_name,
              display_order: cat.display_order,
              is_active: cat.is_active,
            }, { onConflict: 'slug' });
          }
          const { data } = await client
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true });
          if (data && data.length > 0) {
            setLocal(STORAGE_KEYS.CATEGORIES, data);
            return data as Category[];
          }
        } catch (e) {
          console.error('syncDefaultCategories error:', e);
        }
      }
    }
    setLocal(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    return INITIAL_CATEGORIES;
  }

  static async getCategories(): Promise<Category[]> {
    const all = await this.getAllCategories();
    return all.filter((c) => c.is_active);
  }

  static async getAllCategories(): Promise<Category[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true });

          if (!error && data && data.length > 0) {
            // Check if all 9 core departments exist in Supabase
            const existingSlugs = new Set(data.map((c: any) => c.slug));
            const missing = INITIAL_CATEGORIES.filter((c) => !existingSlugs.has(c.slug));
            if (missing.length > 0) {
              for (const m of missing) {
                await client.from('categories').upsert({
                  name: m.name,
                  slug: m.slug,
                  description: m.description,
                  image_url: m.image_url,
                  icon_name: m.icon_name,
                  display_order: m.display_order,
                  is_active: m.is_active,
                }, { onConflict: 'slug' });
              }
              const refetched = await client
                .from('categories')
                .select('*')
                .order('display_order', { ascending: true });
              if (refetched.data && refetched.data.length > 0) {
                setLocal(STORAGE_KEYS.CATEGORIES, refetched.data);
                return refetched.data as Category[];
              }
            }
            setLocal(STORAGE_KEYS.CATEGORIES, data);
            return data as Category[];
          } else if (!error && data && data.length === 0) {
            return await this.syncDefaultCategories();
          }
        } catch (err) {
          console.warn('Supabase getAllCategories failed, using fallback:', err);
        }
      }
    }
    const local = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    return (local && local.length > 0 ? local : INITIAL_CATEGORIES)
      .sort((a, b) => a.display_order - b.display_order);
  }

  static async saveCategory(category: Partial<Category>): Promise<Category> {
    const isNew = !category.id;
    const catToSave: Category = {
      id: category.id || `cat-${Date.now()}`,
      name: category.name || 'Untitled Category',
      slug: category.slug || (category.name || 'cat').toLowerCase().replace(/\s+/g, '-'),
      description: category.description || '',
      image_url: category.image_url || '',
      icon_name: category.icon_name || 'Tag',
      display_order: category.display_order || 99,
      is_active: category.is_active ?? true,
    };

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        const row = { ...catToSave };
        if (isNew || !isValidUUID(catToSave.id)) {
          delete (row as any).id;
          const { data, error } = await client.from('categories').insert(row).select().single();
          if (error) {
            console.error('Supabase saveCategory insert error:', error);
          } else if (data) {
            return data as Category;
          }
        } else {
          const { data, error } = await client.from('categories').update(row).eq('id', catToSave.id).select().single();
          if (error) {
            console.error('Supabase saveCategory update error:', error);
          } else if (data) {
            return data as Category;
          }
        }
      }
    }

    const current = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const updated = isNew 
      ? [...current, catToSave]
      : current.map((c) => (c.id === catToSave.id ? catToSave : c));
    setLocal(STORAGE_KEYS.CATEGORIES, updated);
    return catToSave;
  }

  static async deleteCategory(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        await client.from('categories').delete().eq('id', id);
      }
    }
    const current = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    setLocal(STORAGE_KEYS.CATEGORIES, current.filter((c) => c.id !== id));
    return true;
  }

  // --- PRODUCTS ---
  static async getProducts(filters?: {
    category_id?: string;
    category_slug?: string;
    status?: string;
    search?: string;
    is_featured?: boolean;
    is_trending?: boolean;
    is_new_arrival?: boolean;
    is_on_sale?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
    limit?: number;
  }): Promise<Product[]> {
    let products = await this.getAllAdminProducts();

    // 1. Status filter (default: published)
    if (filters?.status) {
      products = products.filter((p) => p.status === filters.status);
    } else {
      products = products.filter((p) => p.status === 'published');
    }

    // 2. Category filters
    if (filters?.category_id && filters.category_id !== 'all') {
      const target = filters.category_id.toLowerCase().replace(/^cat-/, '');
      products = products.filter((p) => {
        const catSlug = p.category?.slug?.toLowerCase();
        const pCatId = (p.category_id || '').toLowerCase().replace(/^cat-/, '');
        return (
          p.category_id === filters.category_id ||
          pCatId === target ||
          catSlug === target ||
          p.category?.id === filters.category_id ||
          (p.tags && p.tags.some((t) => t.toLowerCase() === target))
        );
      });
    }

    if (filters?.category_slug && filters.category_slug !== 'all') {
      const target = filters.category_slug.toLowerCase().replace(/^cat-/, '');
      products = products.filter((p) => {
        const catSlug = p.category?.slug?.toLowerCase();
        const pCatId = (p.category_id || '').toLowerCase().replace(/^cat-/, '');
        return (
          catSlug === target ||
          pCatId === target ||
          p.category?.id === filters.category_slug ||
          (p.tags && p.tags.some((t) => t.toLowerCase() === target))
        );
      });
    }

    if (filters?.is_featured) products = products.filter((p) => p.is_featured);
    if (filters?.is_trending) products = products.filter((p) => p.is_trending);
    if (filters?.is_new_arrival) products = products.filter((p) => p.is_new_arrival);
    if (filters?.is_on_sale) {
      products = products.filter((p) => p.is_on_sale || (p.discount_percentage && p.discount_percentage > 0));
    }

    // Common search filter
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.short_description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)) ||
          p.category?.name.toLowerCase().includes(q)
      );
    }

    // Price range filters
    if (typeof filters?.minPrice === 'number') {
      products = products.filter((p) => p.price >= filters.minPrice!);
    }
    if (typeof filters?.maxPrice === 'number') {
      products = products.filter((p) => p.price <= filters.maxPrice!);
    }

    // Sorting
    if (filters?.sort) {
      switch (filters.sort) {
        case 'price-asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          products.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'featured':
        default:
          products.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
          break;
      }
    }

    if (filters?.limit && filters.limit > 0) {
      products = products.slice(0, filters.limit);
    }

    return products;
  }

  static async getAllAdminProducts(): Promise<Product[]> {
    const allCats = await this.getAllCategories();
    let supabaseProducts: Product[] = [];

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client
            .from('products')
            .select('*, category:categories(*)');
          if (!error && data && data.length > 0) {
            supabaseProducts = data.map((p: any) => {
              let cat = p.category;
              if (Array.isArray(cat)) cat = cat[0];
              if (!cat && p.category_id) {
                cat = allCats.find((c) =>
                  c.id === p.category_id ||
                  c.slug === p.category_id ||
                  c.slug === p.category_id.replace(/^cat-/, '') ||
                  c.id === p.category_id.replace(/^cat-/, '')
                );
              }
              return { ...p, category: cat };
            }) as Product[];
          }
        } catch (err) {
          console.warn('Error fetching products from Supabase:', err);
        }
      }
    }

    // Fallback & local items
    const localProducts = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS).map((p) => {
      let cat = p.category;
      if (!cat && p.category_id) {
        cat = allCats.find((c) =>
          c.id === p.category_id ||
          c.slug === p.category_id ||
          c.slug === p.category_id.replace(/^cat-/, '') ||
          c.id === p.category_id.replace(/^cat-/, '')
        );
      }
      return { ...p, category: cat };
    });

    if (supabaseProducts.length > 0) {
      // In production with Supabase, Supabase products are the source of truth.
      // Do not resurrect stale seed data or unlisted mock items from local fallback.
      return supabaseProducts;
    }

    return localProducts;
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        const { data, error } = await client
          .from('products')
          .select('*, category:categories(*), variants:product_variants(*)')
          .eq('slug', slug)
          .single();
        if (!error && data) return data as Product;
      }
    }
    const products = await this.getAllAdminProducts();
    return products.find((p) => p.slug === slug) || null;
  }

  static async getProductById(id: string): Promise<Product | null> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        const { data, error } = await client
          .from('products')
          .select('*, category:categories(*), variants:product_variants(*)')
          .eq('id', id)
          .single();
        if (!error && data) return data as Product;
      }
    }
    const products = await this.getAllAdminProducts();
    return products.find((p) => p.id === id) || null;
  }

  static async saveProduct(product: Partial<Product>): Promise<Product> {
    const isNew = !product.id;
    const now = new Date().toISOString();
    const allCats = await this.getAllCategories();
    
    // Auto calculate discount percentage if not provided
    let discount = product.discount_percentage;
    if (product.original_price && product.price && product.original_price > product.price) {
      discount = Math.round(((product.original_price - product.price) / product.original_price) * 100);
    }

    // Resolve matching category
    const matchedCategory = allCats.find(
      (c) =>
        c.id === product.category_id ||
        c.slug === product.category_id ||
        c.slug === (product.category_id || '').replace(/^cat-/, '') ||
        c.name.toLowerCase() === (product.category_id || '').toLowerCase()
    );

    const resolvedCategoryId = matchedCategory?.id || product.category_id || allCats[0]?.id || 'cat-electronics';

    const prodToSave: Product = {
      id: product.id || `prod-${Date.now()}`,
      title: product.title || 'Untitled Product',
      slug: product.slug || (product.title || 'prod').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      short_description: product.short_description || '',
      description: product.description || '',
      images: Array.isArray(product.images) ? product.images : [],
      price: Number(product.price) || 0,
      original_price: product.original_price ? Number(product.original_price) : undefined,
      discount_percentage: discount,
      delivery_charge: typeof product.delivery_charge === 'number' ? Number(product.delivery_charge) : 0,
      category_id: resolvedCategoryId,
      category: matchedCategory,
      tags: product.tags || (matchedCategory ? [matchedCategory.slug] : []),
      sku: product.sku || '',
      stock_quantity: typeof product.stock_quantity === 'number' ? product.stock_quantity : 10,
      variants: product.variants || [],
      is_featured: Boolean(product.is_featured),
      is_trending: Boolean(product.is_trending),
      is_new_arrival: Boolean(product.is_new_arrival),
      is_on_sale: Boolean(product.is_on_sale || (discount && discount > 0)),
      status: product.status || 'published',
      
      // Dropshipping fields
      supplier_id: product.supplier_id,
      supplier_name: product.supplier_name || '',
      supplier_cost: product.supplier_cost ? Number(product.supplier_cost) : undefined,
      supplier_url: product.supplier_url,
      supplier_sku: product.supplier_sku,
      processing_time_days: product.processing_time_days || 2,
      supplier_order_ref: product.supplier_order_ref,

      rating: product.rating ?? 0,
      review_count: product.review_count ?? 0,
      customer_reviews: product.customer_reviews || [],
      specifications: product.specifications || {},
      delivery_info: product.delivery_info || (product.delivery_charge && product.delivery_charge > 0 ? `Delivery: ₹${product.delivery_charge}` : 'Free Doorstep Delivery'),
      return_policy: product.return_policy || '7 days replacement warranty.',
      seo_title: product.seo_title,
      seo_description: product.seo_description,
      created_at: product.created_at || now,
      updated_at: now,
    };

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        // Strip nested virtual objects before inserting to Supabase
        const { category, variants, ...supabaseRow } = prodToSave;

        // Ensure category_id is a valid UUID or look up matching UUID
        if (supabaseRow.category_id && !isValidUUID(supabaseRow.category_id)) {
          const matchedUuidCat = allCats.find(
            (c) =>
              isValidUUID(c.id) &&
              (c.id === supabaseRow.category_id ||
                c.slug === supabaseRow.category_id ||
                c.slug === (supabaseRow.category_id || '').replace(/^cat-/, '') ||
                c.name.toLowerCase() === (supabaseRow.category_id || '').toLowerCase())
          );
          if (matchedUuidCat) {
            supabaseRow.category_id = matchedUuidCat.id;
          } else {
            delete (supabaseRow as any).category_id;
          }
        } else if (!supabaseRow.category_id) {
          delete (supabaseRow as any).category_id;
        }

        if (isNew || !isValidUUID(prodToSave.id)) {
          delete (supabaseRow as any).id;
          const { data, error } = await client
            .from('products')
            .insert(supabaseRow)
            .select('*, category:categories(*)')
            .single();

          if (error) {
            console.error('Supabase product insert error:', error);
          } else if (data) {
            let cat = data.category;
            if (Array.isArray(cat)) cat = cat[0];
            return { ...(data as Product), category: cat || matchedCategory };
          }
        } else {
          const { data, error } = await client
            .from('products')
            .update(supabaseRow)
            .eq('id', prodToSave.id)
            .select('*, category:categories(*)')
            .single();

          if (error) {
            console.error('Supabase product update error:', error);
          } else if (data) {
            let cat = data.category;
            if (Array.isArray(cat)) cat = cat[0];
            return { ...(data as Product), category: cat || matchedCategory };
          }
        }
      }
    }

    const current = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const updated = isNew 
      ? [prodToSave, ...current]
      : current.map((p) => (p.id === prodToSave.id ? prodToSave : p));
    setLocal(STORAGE_KEYS.PRODUCTS, updated);
    return prodToSave;
  }

  static async deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        await client.from('products').delete().eq('id', id);
      }
    }
    const current = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    setLocal(STORAGE_KEYS.PRODUCTS, current.filter((p) => p.id !== id));
    return true;
  }

  // --- SUPPLIERS ---
  static async getSuppliers(): Promise<Supplier[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        const { data, error } = await client.from('suppliers').select('*');
        if (!error && data) return data as Supplier[];
      }
    }
    return getLocal<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
  }

  static async saveSupplier(supplier: Partial<Supplier>): Promise<Supplier> {
    const isNew = !supplier.id;
    const supToSave: Supplier = {
      id: supplier.id || `sup-${Date.now()}`,
      name: supplier.name || 'New Supplier',
      contact_name: supplier.contact_name,
      email: supplier.email || 'supplier@example.com',
      phone: supplier.phone,
      website: supplier.website,
      lead_time_days: supplier.lead_time_days || 3,
      rating: supplier.rating || 4.5,
      status: supplier.status || 'active',
      notes: supplier.notes,
    };

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        const row = { ...supToSave };
        if (isNew || !isValidUUID(supToSave.id)) {
          delete (row as any).id;
          const { data, error } = await client.from('suppliers').insert(row).select().single();
          if (!error && data) return data as Supplier;
        } else {
          const { data, error } = await client.from('suppliers').update(row).eq('id', supToSave.id).select().single();
          if (!error && data) return data as Supplier;
        }
      }
    }

    const current = getLocal<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    const updated = isNew
      ? [...current, supToSave]
      : current.map((s) => (s.id === supToSave.id ? supToSave : s));
    setLocal(STORAGE_KEYS.SUPPLIERS, updated);
    return supToSave;
  }

  // --- DISCOUNTS ---
  static async getDiscounts(): Promise<DiscountCode[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        const { data, error } = await client.from('discounts').select('*');
        if (!error && data) return data as DiscountCode[];
      }
    }
    return getLocal<DiscountCode[]>(STORAGE_KEYS.DISCOUNTS, INITIAL_DISCOUNTS);
  }

  static async validateDiscount(codeStr: string, subtotal: number): Promise<{ valid: boolean; discount?: DiscountCode; discountAmount: number; message: string }> {
    const cleanCode = codeStr.trim().toUpperCase();
    const discounts = await this.getDiscounts();
    const found = discounts.find((d) => d.code.toUpperCase() === cleanCode && d.is_active);

    if (!found) {
      return { valid: false, discountAmount: 0, message: 'Invalid or expired coupon code.' };
    }

    if (subtotal < found.min_order_amount) {
      return {
        valid: false,
        discountAmount: 0,
        message: `This coupon requires a minimum cart total of ₹${found.min_order_amount}.`,
      };
    }

    let amount = 0;
    if (found.discount_type === 'percentage') {
      amount = Math.round((subtotal * found.value) / 100);
      if (found.max_discount_amount && amount > found.max_discount_amount) {
        amount = found.max_discount_amount;
      }
    } else {
      amount = found.value;
    }

    return {
      valid: true,
      discount: found,
      discountAmount: Math.min(amount, subtotal),
      message: `Coupon applied! You saved ₹${amount}.`,
    };
  }

  static async saveDiscount(discount: Partial<DiscountCode>): Promise<DiscountCode> {
    const isNew = !discount.id;
    const discToSave: DiscountCode = {
      id: discount.id || `disc-${Date.now()}`,
      code: (discount.code || 'SAVE10').toUpperCase().trim(),
      discount_type: discount.discount_type || 'percentage',
      value: Number(discount.value) || 10,
      min_order_amount: Number(discount.min_order_amount) || 0,
      max_discount_amount: discount.max_discount_amount ? Number(discount.max_discount_amount) : undefined,
      is_active: discount.is_active ?? true,
      expires_at: discount.expires_at,
      usage_count: discount.usage_count || 0,
    };

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        const row = { ...discToSave };
        if (isNew || !isValidUUID(discToSave.id)) {
          delete (row as any).id;
          const { data, error } = await client.from('discounts').insert(row).select().single();
          if (!error && data) return data as DiscountCode;
        } else {
          const { data, error } = await client.from('discounts').update(row).eq('id', discToSave.id).select().single();
          if (!error && data) return data as DiscountCode;
        }
      }
    }

    const current = getLocal<DiscountCode[]>(STORAGE_KEYS.DISCOUNTS, INITIAL_DISCOUNTS);
    const updated = isNew
      ? [...current, discToSave]
      : current.map((d) => (d.id === discToSave.id ? discToSave : d));
    setLocal(STORAGE_KEYS.DISCOUNTS, updated);
    return discToSave;
  }

  // --- ORDERS ---
  // --- ORDERS ---
  // Internal/Admin query: optional filter by userId / customerEmail
  static async getOrders(userId?: string, customerEmail?: string): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          let query = client
            .from('orders')
            .select('*, items:order_items(*)')
            .order('created_at', { ascending: false });

          if (userId && isValidUUID(userId) && customerEmail) {
            query = query.or(`user_id.eq.${userId},customer_email.ilike.${customerEmail.trim()}`);
          } else if (userId && isValidUUID(userId)) {
            query = query.eq('user_id', userId);
          } else if (customerEmail) {
            query = query.ilike('customer_email', customerEmail.trim());
          }

          const { data, error } = await query;
          if (!error && data) {
            return data.map((o: any) => ({
              ...o,
              items: Array.isArray(o.items) ? o.items : [],
            })) as Order[];
          }
        } catch (e) {
          console.warn('Supabase getOrders error:', e);
        }
      }
    }

    const all = getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
    if (userId || customerEmail) {
      const cleanEmail = customerEmail?.toLowerCase().trim();
      return all.filter((o) => {
        const matchesUser = userId && o.user_id === userId;
        const matchesEmail = cleanEmail && o.customer_email?.toLowerCase().trim() === cleanEmail;
        return matchesUser || matchesEmail;
      });
    }
    return all;
  }

  // Strictly customer order history: never returns unauthenticated or global store orders!
  static async getCustomerOrders(userId?: string, customerEmail?: string): Promise<Order[]> {
    if (!userId && !customerEmail) {
      return []; // Real customer empty state when not authenticated
    }
    return await this.getOrders(userId, customerEmail);
  }

  // Admin orders: all store orders for Admin Dashboard
  static async getAllOrdersForAdmin(): Promise<Order[]> {
    return await this.getOrders();
  }

  static async getOrderById(id: string): Promise<Order | null> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        const { data, error } = await client
          .from('orders')
          .select('*, items:order_items(*)')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) {
          return { ...data, items: Array.isArray(data.items) ? data.items : [] } as Order;
        }
      }
    }
    const orders = await this.getOrders();
    return orders.find((o) => o.id === id) || null;
  }

  static async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const cleanNum = orderNumber.trim();
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        const { data, error } = await client
          .from('orders')
          .select('*, items:order_items(*)')
          .ilike('order_number', cleanNum)
          .maybeSingle();
        if (!error && data) {
          return { ...data, items: Array.isArray(data.items) ? data.items : [] } as Order;
        }
      }
    }
    const orders = await this.getOrders();
    return orders.find((o) => o.order_number.toUpperCase() === cleanNum.toUpperCase()) || null;
  }

  // Validate cart items before checkout (product exists, published, in stock, price valid)
  static async validateCheckoutCart(cartItems: any[]): Promise<{
    valid: boolean;
    errors: string[];
    verifiedSubtotal: number;
    verifiedCart: any[];
  }> {
    const errors: string[] = [];
    const verifiedCart: any[] = [];
    let verifiedSubtotal = 0;

    for (const item of cartItems) {
      const prod = await this.getProductById(item.product.id) || await this.getProductBySlug(item.product.slug);
      
      if (!prod) {
        errors.push(`"${item.product.title}" is no longer available in our store.`);
        continue;
      }

      if (prod.status !== 'published') {
        errors.push(`"${prod.title}" is currently unlisted and cannot be ordered.`);
        continue;
      }

      if (typeof prod.stock_quantity === 'number' && prod.stock_quantity <= 0) {
        errors.push(`"${prod.title}" is currently out of stock.`);
        continue;
      }

      const activePrice = item.variant?.price || prod.price;
      if (typeof activePrice !== 'number' || activePrice <= 0) {
        errors.push(`"${prod.title}" has an invalid price.`);
        continue;
      }

      const itemTotal = activePrice * item.quantity;
      verifiedSubtotal += itemTotal;
      verifiedCart.push({
        ...item,
        product: prod,
      });
    }

    return {
      valid: errors.length === 0 && verifiedCart.length > 0,
      errors,
      verifiedSubtotal,
      verifiedCart,
    };
  }

  static async createOrder(orderInput: {
    user_id?: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: Order['shipping_address'];
    items: Order['items'];
    subtotal: number;
    discount_amount: number;
    discount_code?: string;
    shipping_fee: number;
    total_amount: number;
    payment_method: 'cod' | 'razorpay';
    payment_status: PaymentStatus;
    payment_id?: string;
    notes?: string;
  }): Promise<Order> {
    const now = new Date().toISOString();
    const orderNumber = `TKS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      user_id: orderInput.user_id && isValidUUID(orderInput.user_id) ? orderInput.user_id : undefined,
      ...orderInput,
      fulfilment_status: 'pending',
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { id, items, ...orderRow } = newOrder;
          // Clean up user_id if not valid UUID
          if (!orderRow.user_id || !isValidUUID(orderRow.user_id)) {
            delete (orderRow as any).user_id;
          }
          const { data, error } = await client.from('orders').insert(orderRow).select().single();
          if (!error && data) {
            if (items && items.length > 0) {
              const itemRows = items.map((it) => ({
                order_id: data.id,
                product_id: isValidUUID(it.product_id) ? it.product_id : null,
                product_title: it.product_title,
                product_image: it.product_image,
                sku: it.sku,
                variant_name: it.variant_name,
                unit_price: it.unit_price,
                quantity: it.quantity,
                total_price: it.total_price,
              }));
              await client.from('order_items').insert(itemRows);
            }
            return { ...data, items } as Order;
          } else if (error) {
            console.error('Supabase order insert error:', error);
          }
        } catch (e) {
          console.warn('Could not insert order to Supabase, falling back to local storage:', e);
        }
      }
    }

    const current = getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
    setLocal(STORAGE_KEYS.ORDERS, [newOrder, ...current]);
    return newOrder;
  }

  static async updateOrderStatus(
    orderId: string, 
    updates: {
      fulfilment_status?: FulfilmentStatus;
      payment_status?: PaymentStatus;
      tracking_number?: string;
      tracking_carrier?: string;
      supplier_order_ref?: string;
    }
  ): Promise<Order | null> {
    const now = new Date().toISOString();
    const orders = await this.getOrders();
    const target = orders.find((o) => o.id === orderId || o.order_number === orderId);
    if (!target) return null;

    const updatedOrder: Order = {
      ...target,
      ...updates,
      updated_at: now,
    };

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          if (isValidUUID(target.id)) {
            await client.from('orders').update({ ...updates, updated_at: now }).eq('id', target.id);
          } else if (target.order_number) {
            await client.from('orders').update({ ...updates, updated_at: now }).eq('order_number', target.order_number);
          }
        } catch (err) {
          console.warn('Supabase updateOrderStatus error:', err);
        }
      }
    }

    const currentLocal = getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
    const existsInLocal = currentLocal.some((o) => o.id === target.id || o.order_number === target.order_number);
    const updatedLocal = existsInLocal
      ? currentLocal.map((o) => (o.id === target.id || o.order_number === target.order_number ? updatedOrder : o))
      : [updatedOrder, ...currentLocal];
    setLocal(STORAGE_KEYS.ORDERS, updatedLocal);

    return updatedOrder;
  }

  // --- ANALYTICS ---
  static async getAnalytics() {
    const orders = await this.getOrders();
    const products = await this.getAllAdminProducts();

    const totalRevenue = orders.reduce((sum, o) => sum + (o.payment_status === 'completed' || o.payment_method === 'cod' ? o.total_amount : 0), 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.fulfilment_status === 'delivered').length;
    const pendingOrders = orders.filter((o) => o.fulfilment_status === 'pending' || o.fulfilment_status === 'processing').length;
    
    // Calculate estimated profit: revenue - supplier cost
    let totalEstimatedCost = 0;
    orders.forEach((o) => {
      const orderItems = Array.isArray(o.items) ? o.items : [];
      orderItems.forEach((item) => {
        const prod = products.find((p) => p.id === item.product_id);
        const cost = prod?.supplier_cost || (item.unit_price ? item.unit_price * 0.65 : 0);
        totalEstimatedCost += cost * (item.quantity || 1);
      });
    });

    const estimatedProfit = Math.max(0, totalRevenue - totalEstimatedCost);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    return {
      totalRevenue,
      totalOrders,
      completedOrders,
      pendingOrders,
      estimatedProfit,
      averageOrderValue,
      totalProducts: products.length,
      publishedProducts: products.filter((p) => p.status === 'published').length,
    };
  }

  // ==========================================
  // REGISTERED CUSTOMERS (Google / Auth / Checkout)
  // ==========================================
  static async saveRegisteredCustomer(cust: Partial<RegisteredCustomer>): Promise<void> {
    if (!cust || !cust.email) return;
    const cleanEmail = cust.email.trim().toLowerCase();
    
    // Ignore internal admin accounts
    if (
      cleanEmail === 'admin@thekeralastore.shop' ||
      cleanEmail === 'shopper@example.com' ||
      cleanEmail.includes('admin@') ||
      cust.full_name?.toLowerCase().includes('administrator')
    ) {
      return;
    }

    const customerRecord: RegisteredCustomer = {
      id: cust.id || `cust-${Date.now()}`,
      email: cleanEmail,
      full_name: cust.full_name?.trim() || cleanEmail.split('@')[0],
      phone: cust.phone?.trim() || '',
      avatar_url: cust.avatar_url || '',
      created_at: cust.created_at || new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      source: cust.source || 'google',
    };

    // 1. If Supabase is connected, upsert into customers table
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const payload: any = {
            email: customerRecord.email,
            full_name: customerRecord.full_name,
            phone: customerRecord.phone || null,
            avatar_url: customerRecord.avatar_url || null,
            created_at: customerRecord.created_at,
            last_sign_in_at: customerRecord.last_sign_in_at,
          };
          if (isValidUUID(customerRecord.id)) {
            payload.id = customerRecord.id;
          }

          const { error } = await client.from('customers').upsert(payload, { onConflict: 'email' });
          if (error) {
            // If table doesn't exist, try 'profiles' table
            if (error.code === '42P01' || error.message?.includes('does not exist')) {
              try {
                await client.from('profiles').upsert(payload, { onConflict: 'email' });
              } catch {}
            }
          }
        } catch (dbErr) {
          console.warn('Could not sync customer to Supabase:', dbErr);
        }
      }
    }

    // 2. Always persist into localStorage as fallback / instant cache
    if (typeof window !== 'undefined') {
      try {
        const existing: RegisteredCustomer[] = getLocal(STORAGE_KEYS.CUSTOMERS, []);
        const idx = existing.findIndex((c) => c.email.toLowerCase() === cleanEmail);
        if (idx >= 0) {
          existing[idx] = { ...existing[idx], ...customerRecord };
        } else {
          existing.unshift(customerRecord);
        }
        setLocal(STORAGE_KEYS.CUSTOMERS, existing);
      } catch (lsErr) {
        console.error('Error saving customer locally:', lsErr);
      }
    }
  }

  static async getRegisteredCustomers(): Promise<RegisteredCustomer[]> {
    let list: RegisteredCustomer[] = [];

    // 1. Try Supabase first if configured
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && Array.isArray(data)) {
            list = data.map((d: any) => ({
              id: d.id,
              email: d.email,
              full_name: d.full_name || d.name || d.email?.split('@')[0],
              phone: d.phone || '',
              avatar_url: d.avatar_url || '',
              created_at: d.created_at || d.inserted_at || new Date().toISOString(),
              last_sign_in_at: d.last_sign_in_at,
              source: 'google',
            }));
          } else {
            // Try fallback table 'profiles'
            const profRes = await client.from('profiles').select('*');
            if (!profRes.error && Array.isArray(profRes.data)) {
              list = profRes.data.map((d: any) => ({
                id: d.id,
                email: d.email,
                full_name: d.full_name || d.name || d.email?.split('@')[0],
                phone: d.phone || '',
                avatar_url: d.avatar_url || '',
                created_at: d.created_at || new Date().toISOString(),
                last_sign_in_at: d.last_sign_in_at,
                source: 'google',
              }));
            }
          }
        } catch (dbErr) {
          console.warn('Error reading customers from Supabase:', dbErr);
        }
      }
    }

    // 2. Merge with local storage fallback
    if (typeof window !== 'undefined') {
      const localList: RegisteredCustomer[] = getLocal(STORAGE_KEYS.CUSTOMERS, []);
      const map = new Map<string, RegisteredCustomer>();
      list.forEach((c) => {
        const email = (c.email || '').trim().toLowerCase();
        if (email) map.set(email, c);
      });
      localList.forEach((c) => {
        const email = (c.email || '').trim().toLowerCase();
        if (email && !map.has(email)) {
          map.set(email, c);
        }
      });
      list = Array.from(map.values());
    }

    // Filter out dummy/admin accounts
    return list.filter((c) => {
      const em = (c.email || '').trim().toLowerCase();
      const fn = (c.full_name || '').trim().toLowerCase();
      return (
        em &&
        em !== 'admin@thekeralastore.shop' &&
        em !== 'shopper@example.com' &&
        !em.includes('admin@') &&
        !fn.includes('administrator') &&
        !fn.includes('rohit sharma')
      );
    });
  }

  // Reset to initial seed data
  static resetLocalData() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(INITIAL_SUPPLIERS));
    localStorage.setItem(STORAGE_KEYS.DISCOUNTS, JSON.stringify(INITIAL_DISCOUNTS));
  }
}

