'use server'; // Mark this module as containing Server Actions

import { revalidatePath, revalidateTag } from 'next/cache';
import { cache } from 'react';
import { createClient } from '@/app/lib/supabase/server'; // Use the server client
import { Product } from '@/app/lib/types'; // Import Product type

/**
 * Interface for a wishlist item joined with product details
 */
export interface WishlistItemWithProduct {
  id: number; // Wishlist item ID
  customer_id: string;
  product_id: number; // This is the foreign key column
  added_at: string;
  products: Product | null; // Explicit select should return object or null
}

/**
 * Response type for wishlist operations
 */
export interface WishlistResponse<T> {
  success: boolean;
  data?: T; 
  error?: string;
}

/**
 * Fetches all wishlist items for the current authenticated user
 * 
 * @returns Array of wishlist items with joined product details
 */
export const getWishlistItems = cache(async function getWishlistItems(): Promise<WishlistResponse<WishlistItemWithProduct[]>> {
  const supabase = createClient();

  try {
    // 1. Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error fetching user for wishlist:', userError);
      return { 
        success: false, 
        error: userError?.message || 'User not authenticated',
        data: [] 
      };
    }

    // 2. Fetch wishlist items and explicitly select joined product columns
    const response = await supabase
      .from('wishlist_items')
      .select(`
        id,
        customer_id,
        product_id,
        added_at,
        products ( id, name, description, price, images, sizes, colors, stock_quantity, category, tags, created_at, updated_at ) 
      `)
      .eq('customer_id', user.id)
      .order('added_at', { ascending: false });

    if (response.error) {
      console.error('Error fetching wishlist items:', response.error);
      return { 
        success: false, 
        error: response.error.message || 'Could not fetch wishlist items.',
        data: [] 
      };
    }

    // Transform products array into single Product or null
    const rawItems = response.data || [];
    const items: WishlistItemWithProduct[] = rawItems.map(item => ({
      id: item.id,
      customer_id: item.customer_id,
      product_id: item.product_id,
      added_at: item.added_at,
      products: Array.isArray(item.products) && item.products.length > 0
        ? item.products[0]
        : null
    }));
    return { success: true, data: items };
  } catch (error) {
    console.error('Unexpected error fetching wishlist:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred while retrieving your wishlist',
      data: [] 
    };
  }
});

/**
 * Adds a product to the user's wishlist
 * 
 * @param productId The ID of the product to add to wishlist
 * @returns Response indicating success or failure
 */
export async function addWishlistItem(productId: number): Promise<WishlistResponse<null>> {
  const supabase = createClient();

  try {
    // 1. Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error adding wishlist item (user fetch):', userError);
      return { success: false, error: 'User not authenticated' };
    }

    // 2. Insert the item
    const { error } = await supabase
      .from('wishlist_items')
      .insert({ customer_id: user.id, product_id: productId });

    if (error) {
      // Handle potential duplicate entry error (unique constraint)
      if (error.code === '23505') { // PostgreSQL unique violation code
        console.warn('Item already in wishlist:', error.message);
        return { success: true, error: 'Item already exists in wishlist.' }; // Still considered "success" in a way
      }
      console.error('Error adding wishlist item:', error);
      return { success: false, error: error.message || 'Could not add item to wishlist.' };
    }

    // 3. Revalidate the wishlist page path so it shows the new item
    revalidatePath('/account/wishlist');
    revalidateTag('wishlist');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error adding to wishlist:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Removes an item from the user's wishlist
 * 
 * @param wishlistItemId The ID of the wishlist item to remove
 * @returns Response indicating success or failure
 */
export async function removeWishlistItem(wishlistItemId: number): Promise<WishlistResponse<null>> {
  const supabase = createClient();

  try {
    // 1. Get the current user (to ensure they own the item via RLS)
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error removing wishlist item (user fetch):', userError);
      return { success: false, error: 'User not authenticated' };
    }

    // 2. Delete the item by its specific ID
    // RLS policy ensures users can only delete their own items
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', wishlistItemId)
      .eq('customer_id', user.id); // Double-check ownership (belt and suspenders)

    if (error) {
      console.error('Error removing wishlist item:', error);
      return { success: false, error: error.message || 'Could not remove item from wishlist.' };
    }

    // 3. Revalidate the wishlist page path
    revalidatePath('/account/wishlist');
    revalidateTag('wishlist');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error removing from wishlist:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
