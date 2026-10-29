export type PublicationStatus = 'draft' | 'published' | 'archived';

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Space Grey / 256GB" or "Large / Green"
  sku?: string;
  price?: number; // Override price if different
  original_price?: number;
  stock: number;
  attributes: Record<string, string>; // { Color: 'Green', Size: 'M' }
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  icon_name?: string;
  display_order: number;
  is_active: boolean;
  product_count?: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  images: string[];
  price: number; // in INR
  original_price?: number; // in INR
  discount_percentage?: number;
  category_id: string;
  category?: Category;
  tags: string[];
  sku: string;
  stock_quantity: number;
  variants: ProductVariant[];
  
  // Marketing & Display flags
  is_featured: boolean;
  is_trending: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  status: PublicationStatus;
  
  // Dropshipping fields (Internal / Admin-only)
  supplier_id?: string;
  supplier_name?: string;
  supplier_cost?: number; // internal cost in INR
  supplier_url?: string; // private supplier portal URL
  supplier_sku?: string;
  processing_time_days?: number;
  supplier_order_ref?: string;

  // Additional details
  delivery_charge?: number; // Custom delivery fee in INR (0 = Free Delivery)
  rating: number;
  review_count: number;
  customer_reviews?: ProductReview[];
  specifications: Record<string, string>;
  delivery_info?: string;
  return_policy?: string;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  verified_purchase: boolean;
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  selected_attributes?: Record<string, string>;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export type PaymentMethod = 'cod' | 'razorpay';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type FulfilmentStatus = 
  | 'pending' 
  | 'processing' 
  | 'supplier_ordered' 
  | 'shipped' 
  | 'out_for_delivery'
  | 'delivered' 
  | 'cancelled';

export interface OrderItem {
  product_id: string;
  product_title: string;
  product_image: string;
  sku: string;
  variant_name?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  discount_code?: string;
  shipping_fee: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_id?: string;
  fulfilment_status: FulfilmentStatus;
  tracking_number?: string;
  tracking_carrier?: string;
  supplier_order_ref?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_name?: string;
  email: string;
  phone?: string;
  website?: string;
  lead_time_days: number;
  rating: number;
  status: 'active' | 'inactive';
  notes?: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  is_active: boolean;
  expires_at?: string;
  usage_count: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'customer';
  created_at: string;
}

export interface RegisteredCustomer {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  last_sign_in_at?: string;
  source?: 'google' | 'email' | 'checkout';
}

