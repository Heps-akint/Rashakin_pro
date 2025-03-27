import supabase from './supabase';
import { Order, Product } from './types';

// Admin email that has access to the dashboard
export const ADMIN_EMAIL = 'admin@rashakin.com';

// Check if the current user is admin
export async function checkIsAdmin() {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  
  if (!session) {
    return false;
  }
  
  return session.user.email === ADMIN_EMAIL;
}

// Shared order status options
export const ORDER_STATUSES = ['Pending', 'Processing', 'Completed', 'Cancelled'];

// Shared payment status options
export const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];

// Format currency to fixed 2 decimal places with dollar sign
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// Format date to a more readable format
export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Get status badge class based on status
export function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'Processing':
      return 'bg-blue-100 text-blue-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Get payment status badge class
export function getPaymentStatusBadgeClass(status: string) {
  switch (status) {
    case 'Paid':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Failed':
      return 'bg-red-100 text-red-800';
    case 'Refunded':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Fetch orders with pagination and optional filters
 */
export async function fetchOrdersWithFilters({
  page = 1,
  perPage = 10,
  status = null,
  fromDate = null,
  search = null
}: {
  page?: number;
  perPage?: number;
  status?: string | null;
  fromDate?: Date | null;
  search?: string | null;
}) {
  // Calculate pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  
  // Build query
  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' });
  
  // Apply filters
  if (status) {
    query = query.eq('status', status);
  }
  
  if (fromDate) {
    query = query.gte('created_at', fromDate.toISOString());
  }
  
  if (search) {
    const isNumeric = !isNaN(parseInt(search));
    if (isNumeric) {
      query = query.eq('id', parseInt(search));
    } else {
      query = query.or(`customer_email.ilike.%${search}%,customer_name.ilike.%${search}%`);
    }
  }
  
  // Apply pagination and ordering
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);
  
  if (error) {
    throw error;
  }
  
  const totalPages = count ? Math.ceil(count / perPage) : 1;
  
  return {
    orders: data as Order[],
    totalPages,
    count
  };
}

/**
 * Fetch products with pagination and optional filters
 */
export async function fetchProductsWithFilters({
  page = 1,
  perPage = 10,
  category = null,
  lowStock = false,
  search = null
}: {
  page?: number;
  perPage?: number;
  category?: string | null;
  lowStock?: boolean;
  search?: string | null;
}) {
  // Calculate pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  
  // Build query
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' });
  
  // Apply filters
  if (category) {
    query = query.eq('category', category);
  }
  
  if (lowStock) {
    query = query.lt('stock_quantity', 10);
  }
  
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }
  
  // Apply pagination
  const { data, error, count } = await query
    .order(lowStock ? 'stock_quantity' : 'id')
    .range(from, to);
  
  if (error) {
    throw error;
  }
  
  const totalPages = count ? Math.ceil(count / perPage) : 1;
  
  return {
    products: data as Product[],
    totalPages,
    count
  };
} 