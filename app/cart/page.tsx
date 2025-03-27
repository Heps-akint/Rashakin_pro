"use client";

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/app/lib/cart-context';
import CartItemComponent from '@/app/components/cart/CartItemComponent';

export default function CartPage() {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  
  // Format the total price
  const formattedTotal = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(totalPrice);
  
  // If the cart is empty, display a message
  if (items.length === 0) {
    return (
      <div className="container-padded py-12">
        <h1 className="text-3xl font-serif font-bold mb-8">Shopping Cart</h1>
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 text-gray-300 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          <h2 className="text-2xl font-medium mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link href="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-padded py-12">
      <h1 className="text-3xl font-serif font-bold mb-8">Shopping Cart ({totalItems})</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-medium">Your Items</h2>
              <button
                onClick={clearCart}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear Cart
              </button>
            </div>
            
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="p-4">
                  <CartItemComponent item={item} />
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6">
            <Link href="/products" className="text-primary hover:text-primary/90 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>
        
        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg p-6 sticky top-20">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formattedTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between font-medium mb-6">
                <span>Total</span>
                <span>{formattedTotal}</span>
              </div>
              
              <Link href="/checkout" className="btn btn-primary w-full mb-4">
                Proceed to Checkout
              </Link>
              
              <div className="text-xs text-center text-gray-500">
                <p>Secure checkout powered by Stripe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 