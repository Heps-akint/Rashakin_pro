import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// In development, we'll provide a more helpful message if credentials are missing
if (!supabaseUrl || !supabaseAnonKey) {
  // Check if we're in a browser environment (client side)
  if (typeof window !== 'undefined') {
    console.warn(
      'Missing Supabase credentials. Please make sure you have a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
  // For server-side (SSR), we'll still throw the error to prevent unexpected behavior
  if (typeof window === 'undefined') {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
  }
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

export default supabase; 