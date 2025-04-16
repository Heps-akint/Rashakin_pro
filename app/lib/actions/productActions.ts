'use server';

import { createClient } from '@/app/lib/supabase/server';
import { Product } from '@/app/lib/types';
import { cache } from 'react';

/**
 * Fetches the newest products from the database
 * @param limit Number of products to fetch
 * @returns Array of products or empty array if error occurs
 */
export const getNewestProducts = cache(async (limit: number = 4): Promise<Product[]> => {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching new arrivals:', error);
      return [];
    }
    
    return data as Product[];
  } catch (error) {
    console.error('Error in getNewestProducts:', error);
    return [];
  }
});

/**
 * Fetches a product by its ID
 * @param productId The ID of the product to fetch
 * @returns Product object or null if not found
 */
export const getProductById = cache(async (productId: string): Promise<Product | null> => {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
      
    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }
    
    return data as Product;
  } catch (error) {
    console.error('Error in getProductById:', error);
    return null;
  }
});

/**
 * Fetches products by category
 * @param category Category to filter by
 * @param limit Number of products to fetch
 * @returns Array of products or empty array if error occurs
 */
export const getProductsByCategory = cache(async (category: string, limit: number = 8): Promise<Product[]> => {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .limit(limit);
      
    if (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
    
    return data as Product[];
  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    return [];
  }
});
