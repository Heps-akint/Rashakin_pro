// Product interfaces
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  images: string[];
  sizes: string[];
  colors: string[];
  stock_quantity: number;
  category?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// Order interfaces
export enum OrderStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
  Returned = 'Returned',
}

export enum PaymentStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Failed = 'Failed',
  Refunded = 'Refunded',
}

export interface OrderItem {
  product_name: string;
  price: number;
  quantity: number;
  size?: string | null;
  color?: string | null;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: number;
  customer_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  status: string;
  total_amount: number;
  payment_status: string;
  shipping_address: Address;
  billing_address: Address;
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
}

// Customer interface
export interface Customer {
  id: string;
  name: string;
  email: string;
  address?: Address;
  phone_number?: string;
  order_history: number[];
  created_at: string;
  updated_at: string;
}

// Review interface
export interface Review {
  id: number;
  product_id: number;
  customer_id: string;
  rating: number;
  comment: string;
  date: string;
}

// Wishlist interface
export interface Wishlist {
  id: number;
  customer_id: string;
  product_ids: number[];
  created_at: string;
  updated_at: string;
} 