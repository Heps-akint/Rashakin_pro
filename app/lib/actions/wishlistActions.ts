'use server'; // Mark this module as containing Server Actions

import { revalidatePath } from 'next/cache';
import { createClient } from '@/app/lib/supabase/server'; // Use the server client
import { Product } from '@/app/lib/types'; // Import Product type
import { PostgrestSingleResponse } from '@supabase/supabase-js'; // Import the specific response type

// Define the type for a wishlist item joined with product details
// Adjusting back: explicit select usually returns a single object or null
export interface WishlistItemWithProduct {
  id: number; // Wishlist item ID
  customer_id: string;
  product_id: number; // This is the foreign key column
  added_at: string;
  products: Product | null; // Explicit select should return object or null
}

// Action to get wishlist items for the current user
export async function getWishlistItems(): Promise<WishlistItemWithProduct[]> {
  const supabase = createClient();

  // 1. Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Error fetching user for wishlist:', userError);
    return [];
  }

  // 2. Fetch wishlist items and explicitly select joined product columns
  // Type the entire response object using Supabase's type
  // We expect an array of items, where each item has a products object/null
  const response: PostgrestSingleResponse<WishlistItemWithProduct[]> = await supabase
    .from('wishlist_items')
    .select(`
      id,
      customer_id,
      product_id,
      added_at,
      products ( id, name, price, images, sizes, colors, stock_quantity, category, tags ) 
    `)
    .eq('customer_id', user.id)
    .order('added_at', { ascending: false });

  if (response.error) {
    console.error('Error fetching wishlist items:', response.error);
    throw new Error('Could not fetch wishlist items.'); // Or return an error object
  }

  // Return the data property from the typed response
  return response.data || [];
}

// Action to add an item to the wishlist
export async function addWishlistItem(productId: number): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

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
    return { success: false, error: 'Could not add item to wishlist.' };
  }

  // 3. Revalidate the wishlist page path so it shows the new item
  revalidatePath('/account/wishlist');

  return { success: true };
}

// Action to remove an item from the wishlist
export async function removeWishlistItem(wishlistItemId: number): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

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
    return { success: false, error: 'Could not remove item from wishlist.' };
  }

  // 3. Revalidate the wishlist page path
  revalidatePath('/account/wishlist');

  return { success: true };
}
