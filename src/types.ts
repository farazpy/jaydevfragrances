// Shared TypeScript definitions for Jaydev Fragrances eCommerce

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  email_verified: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  brand_id?: number;
  category_id?: number;
  subcategory_id?: number;
  short_description?: string;
  long_description?: string;
  specifications?: string; // JSON string
  ingredients?: string;
  how_to_use?: string;
  return_policy?: string;
  shipping_info?: string;
  sku?: string;
  barcode?: string;
  weight?: string;
  is_featured: boolean;
  is_trending: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  rating: string;
  rating_count: number;
  brand_name?: string;
  category_name?: string;
  subcategory_name?: string;
  min_price?: number;
  max_mrp?: number;
  primary_image?: string;
  // Agarbatti specific attributes
  burn_time?: string;
  scent_type?: string;
  packaging_type?: string;
  pooja_deity?: string;
}

export interface AdminCoupon {
  id: number;
  code: string;
  type: 'percentage' | 'flat';
  discount_value: number;
  min_amount: number;
  expiry_date?: string;
  usage_limit: number;
  used_count: number;
  created_at: string;
  updated_at?: string;
}

export interface AdminReview {
  id: number;
  user_id: number;
  product_id: number;
  order_id?: number;
  rating: number;
  comment?: string;
  is_verified: boolean;
  created_at: string;
  user_name?: string;
  user_email?: string;
  product_name?: string;
  product_slug?: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  size: string;
  volume?: string;
  mrp: number;
  sale_price: number;
  stock: number;
  sku?: string;
  barcode?: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  variant_id: number;
  quantity: number;
  product_name: string;
  product_slug: string;
  size: string;
  volume?: string;
  mrp: number;
  sale_price: number;
  stock: number;
  primary_image?: string;
  
  // Convenience aliases for routing and presentation
  price: number;
  name: string;
  image: string;
  slug: string;
  brand?: string;
}

export interface WishlistItem {
  id: number; // wishlist record ID
  name: string;
  slug: string;
  min_price?: number;
  max_mrp?: number;
  primary_image?: string;
  rating: string;
  rating_count: number;
}

export interface Address {
  id: number;
  user_id: number;
  type: string; // 'Home', 'Office', 'Other'
  name: string;
  phone: string;
  email?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip: string;
  is_default: boolean;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'flat';
  discount_value: number;
}

export interface Order {
  id: number;
  user_id?: number;
  order_number: string;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Refunded';
  total_mrp: number;
  total_discount: number;
  total_gst: number;
  shipping_charges: number;
  grand_total: number;
  coupon_code?: string;
  coupon_discount: number;
  billing_name: string;
  billing_email: string;
  billing_phone: string;
  billing_address_line1: string;
  billing_address_line2?: string;
  billing_city: string;
  billing_state: string;
  billing_zip: string;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  payment_method: 'COD' | 'Razorpay';
  payment_status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  created_at: string;
  total_items?: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id?: number;
  variant_id?: number;
  product_name: string;
  variant_name?: string;
  quantity: number;
  mrp: number;
  price: number;
  total_price: number;
  product_slug?: string;
  primary_image?: string;
}

export interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment?: string;
  is_verified: boolean;
  user_name: string;
  created_at: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  link?: string;
  sort_order: number;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  is_active: boolean;
}

export interface ActivityLog {
  id: number;
  user_id?: number;
  user_name?: string;
  user_email?: string;
  session_id?: string;
  event_type: string;
  affected_module: string;
  request_metadata?: string; // JSON
  response_status?: number;
  device_info?: string;
  ip_address?: string;
  context_data?: string; // JSON
  created_at: string;
}
