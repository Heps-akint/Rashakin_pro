'use client';

import React, { useState, useTransition } from 'react';
import { Product } from '@/app/lib/types';
import { useCart } from '@/app/lib/cart-context';
import { useAuth } from '@/app/lib/auth-context';
import { addWishlistItem } from '@/app/lib/actions/wishlistActions';
import { toast } from 'react-toastify';

interface ProductInteractionProps {
  product: Product;
}

export default function ProductInteraction({ product }: ProductInteractionProps) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [isPendingWishlist, startTransitionWishlist] = useTransition();
  const [selectedSize, setSelectedSize] = useState<string | null>(product.sizes?.[0] || null); // Default to first size or null
  const [selectedColor, setSelectedColor] = useState<string | null>(product.colors?.[0] || null); // Default to first color or null
  const [quantity, setQuantity] = useState<number>(1);

  const handleAddToCart = () => {
    if (!product) return;

    // Basic validation: Ensure a size/color is selected if available
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.warn('Please select a size.');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.warn('Please select a color.');
      return;
    }

    addItem(product, quantity, selectedSize ?? undefined, selectedColor ?? undefined);
    toast.success(`${product.name} added to cart!`); // Add success toast here
  };

  const handleAddToWishlist = () => {
    if (!user) {
      // Keep alert for login prompt, as it's an edge case requiring immediate attention
      toast.warn('Please log in to add items to your wishlist.');
      // Optionally redirect to login page
      return;
    }

    startTransitionWishlist(async () => {
      try {
        await addWishlistItem(product.id);
        toast.success(`${product.name} added to your wishlist!`);
        // Optionally: Update UI state if needed (e.g., change heart icon fill)
      } catch (error) {
        console.error('Failed to add item to wishlist:', error);
        toast.error(`Error adding ${product.name} to wishlist. Please try again.`);
      }
    });
  };

  return (
    <div>
      {/* Sizes */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Size: <span className="font-bold">{selectedSize || 'Select size'}</span></h3>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size: string) => (
              <button 
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary 
                            ${selectedSize === size 
                              ? 'border-primary text-primary ring-1 ring-primary' 
                              : 'border-gray-300 text-gray-700 hover:border-gray-500'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {product.colors && product.colors.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Color: <span className="font-bold">{selectedColor || 'Select color'}</span></h3>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color: string) => (
              <button 
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`h-8 w-8 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary 
                            ${selectedColor === color ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                style={{ backgroundColor: color.toLowerCase() }} // Simple background color
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selector (Optional but recommended) */}
      <div className="mb-6 w-32">
         <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
         <input 
           type="number"
           id="quantity"
           name="quantity"
           min="1"
           max={product.stock_quantity} // Assuming stock_quantity exists
           value={quantity}
           onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10)))}
           className="w-full border border-gray-300 rounded-md text-center px-2 py-1 focus:ring-primary focus:border-primary"
         />
      </div>

      {/* Add to cart button */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={handleAddToCart}
          disabled={product.stock_quantity <= 0} // Disable if out of stock
          className="btn btn-primary flex-grow px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
        
        <button 
          onClick={handleAddToWishlist}
          disabled={isPendingWishlist || !user} // Disable if action pending or user not logged in
          className={`px-4 py-2 border border-gray-300 rounded-md flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {isPendingWishlist ? 'Adding...' : 'Add to Wishlist'}
        </button>
      </div>
    </div>
  );
}
