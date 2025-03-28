"use client";

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/app/lib/cart-context';
import { CartItem } from '@/app/lib/types';

interface CartItemComponentProps {
  item: CartItem;
}

const CartItemComponent: React.FC<CartItemComponentProps> = ({ item }) => {
  const { updateItemQuantity, removeItem } = useCart();
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      updateItemQuantity(item.id, newQuantity, item.size, item.color);
    }
  };
  
  const handleRemove = () => {
    removeItem(item.id, item.size, item.color);
  };
  
  // Format price
  const formattedPrice = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(item.price);
  
  // Format total price for this item
  const formattedTotalPrice = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(item.price * item.quantity);
  
  return (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-200 last:border-0">
      {/* Product image */}
      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded overflow-hidden">
        <Link href={`/products/${item.id}`}>
          {item.image ? (
            <div 
              className="w-full h-full bg-center bg-cover" 
              style={{ backgroundImage: `url(${item.image})` }}
              aria-label={`Image of ${item.name}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs">
              No Image
            </div>
          )}
        </Link>
      </div>
      
      {/* Product details */}
      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.id}`} className="text-sm font-medium text-gray-900 hover:text-primary truncate block">
          {item.name}
        </Link>
        
        {/* Price */}
        <div className="mt-1 flex items-center text-sm text-gray-500 space-x-1">
          <span>{formattedPrice}</span>
          <span>×</span>
          <span>{item.quantity}</span>
          <span>=</span>
          <span className="font-medium text-gray-900">{formattedTotalPrice}</span>
        </div>
        
        {/* Variants (size/color) */}
        {(item.size || item.color) && (
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
            {item.size && <span>Size: {item.size}</span>}
            {item.color && (
              <span className="flex items-center">
                Color: 
                <span 
                  className="ml-1 w-3 h-3 rounded-full border border-gray-300 inline-block"
                  style={{ backgroundColor: item.color.toLowerCase() }}
                  aria-label={`Color: ${item.color}`}
                ></span>
                {item.color}
              </span>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="mt-2 flex items-center">
          {/* Quantity controls */}
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100"
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            
            <span className="w-8 text-xs text-center">{item.quantity}</span>
            
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100"
              aria-label="Increase quantity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          {/* Remove button */}
          <button
            onClick={handleRemove}
            className="ml-3 text-xs text-red-600 hover:text-red-800"
            aria-label="Remove item"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItemComponent;