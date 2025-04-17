'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useAuth } from '@/app/lib/auth-context'; 
import { getWishlistItems, removeWishlistItem, WishlistItemWithProduct } from '@/app/lib/actions/wishlistActions';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';

export default function WishlistPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<number | null>(null); 
  const [isPendingRemove, startTransitionRemove] = useTransition();

  useEffect(() => {
    if (!authLoading && user) {
      setIsLoading(true); 
      setError(null); 
      getWishlistItems()
        .then(res => {
          if (res.success) {
            const items = res.data || [];
            // only show items with product data
            const validItems = items.filter(item => item.products !== null);
            setWishlistItems(validItems);
          } else {
            console.error('Wishlist fetch error:', res.error);
            setError(res.error || 'Failed to load your wishlist. Please try again later.');
          }
        })
        .catch(err => {
          console.error("Wishlist fetch error:", err);
          setError('Failed to load your wishlist. Please try again later.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    if (!authLoading && !user) {
        setWishlistItems([]);
        setIsLoading(false);
    }
  }, [user, authLoading]); 

  const handleRemoveItem = (itemId: number) => {
    setRemovingItemId(itemId);
    startTransitionRemove(async () => {
      const removedItem = wishlistItems.find(item => item.id === itemId);
      try {
        await removeWishlistItem(itemId);
        // Optimistic UI update: Filter out the removed item immediately
        setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
        toast.success(`${removedItem?.products?.name || 'Item'} removed from wishlist.`);
      } catch (error) {
        console.error('Failed to remove item from wishlist:', error);
        toast.error('Error removing item. Please try again.');
        // Optionally: Revert optimistic update if needed, though filtering is usually safe
      } finally {
        setRemovingItemId(null); // Reset removing state regardless of outcome
      }
    });
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[300px]">
        <p>Loading user...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">My Wishlist</h1>
        <p>Please <Link href="/auth/login" className="text-primary hover:underline">login</Link> to view your wishlist.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[300px]">
        <p>Loading wishlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">My Wishlist</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">My Wishlist</h1>
        <p>Your wishlist is currently empty.</p>
        <Link href="/products" className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">My Wishlist</h1>
      <ul className="space-y-4">
        {wishlistItems.map((item) => {
          const product = item.products;
          const isCurrentlyRemoving = removingItemId === item.id && isPendingRemove;

          if (!product) return null;

          const imageUrl = product.images?.[0] || '/placeholder.png';

          return (
            <li
              key={item.id}
              className={`flex items-center justify-between border p-4 rounded-md transition-opacity duration-300 ${isCurrentlyRemoving ? 'opacity-50' : 'opacity-100'}`}
            >
              <div className="flex items-center space-x-4">
                <Link href={`/products/${product.id}`} className="block flex-shrink-0">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="rounded object-cover"
                  />
                </Link>
                <div>
                  <Link href={`/products/${product.id}`} className="hover:underline">
                    <h3 className="font-medium text-lg">{product.name}</h3>
                  </Link>
                  <p className="text-gray-600">{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(product.price)}</p>
                  {/* Add other product details if needed */}
                </div>
              </div>
              <button
                onClick={() => handleRemoveItem(item.id)}
                disabled={isCurrentlyRemoving}
                className={`text-gray-500 hover:text-red-600 transition-colors ${isCurrentlyRemoving ? 'cursor-not-allowed' : ''}`}
                aria-label="Remove item from wishlist"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
