"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/app/lib/cart-context';
import CartItemComponent from './CartItemComponent';

const CartSidebar = () => {
  const { 
    items, 
    isCartOpen, 
    closeCart, 
    totalItems, 
    totalPrice,
    clearCart
  } = useCart();

  // Prevent scrolling when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isCartOpen]);

  // Format the total price
  const formattedTotal = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(totalPrice);

  // If the cart is not open, don't render anything
  if (!isCartOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop - darkens the background and closes cart when clicked */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={closeCart}
        aria-hidden="true"
      />
      
      {/* Cart sidebar */}
      <div className="relative w-full max-w-md bg-white shadow-xl flex flex-col transform transition-transform duration-300">
        {/* Cart header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            Shopping Cart ({totalItems})
          </h2>
          <button
            onClick={closeCart}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Cart content */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-300 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <button
                onClick={closeCart}
                className="btn btn-primary"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <CartItemComponent key={`${item.id}-${item.size}-${item.color}`} item={item} />
              ))}
              
              {/* Clear cart button */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Cart footer with totals and checkout button */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Subtotal</span>
              <span>{formattedTotal}</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Shipping and taxes calculated at checkout
            </p>
            <div className="space-y-2">
              <Link
                href="/checkout"
                className="btn btn-primary w-full"
                onClick={closeCart}
              >
                Checkout
              </Link>
              <button
                onClick={closeCart}
                className="btn btn-outline w-full"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar; 