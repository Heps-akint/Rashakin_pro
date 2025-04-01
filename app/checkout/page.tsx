"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/app/lib/cart-context';
import CartItemComponent from '@/app/components/cart/CartItemComponent';

// Validation helpers
const validateEmail = (email: string) => {
  return /\S+@\S+\.\S+/.test(email);
};

const validatePhone = (phone: string) => {
  return phone.replace(/\D/g, '').length >= 10;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalItems, totalPrice, clearCart } = useCart();
  
  // Customer form state
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  // Form errors state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Loading state for the checkout button
  const [isLoading, setIsLoading] = useState(false);
  
  // Format the total price
  const formattedTotal = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(totalPrice);
  
  // If the cart is empty, redirect to the cart page
  if (items.length === 0) {
    router.push('/cart');
    return null;
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerDetails({
      ...customerDetails,
      [name]: value,
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!customerDetails.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!customerDetails.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(customerDetails.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!customerDetails.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(customerDetails.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          customerDetails,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      // Redirect to Stripe checkout
      if (data.url) {
        // Redirect to Stripe checkout page
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container-padded py-12">
      <h1 className="text-3xl font-serif font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Details Form */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium">Contact Information</h2>
              <p className="text-sm text-gray-500 mt-1">
                We'll use this to send your order confirmation and shipping updates.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={customerDetails.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={customerDetails.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={customerDetails.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                  required
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
              
              <div className="mt-8 p-4 bg-gray-50 rounded-md text-sm">
                <p className="font-medium mb-2">Next Steps:</p>
                <p className="text-gray-600">
                  After clicking "Proceed to Payment", you'll be taken to our secure payment provider
                  to complete your purchase. There, you can enter your shipping address and payment details.
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-200">
                <Link href="/cart" className="text-primary hover:text-primary/90 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Cart
                </Link>
                
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg sticky top-20">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium">Order Summary ({totalItems})</h2>
            </div>
            
            <div className="p-4 max-h-80 overflow-y-auto">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="mb-4 last:mb-0">
                  <CartItemComponent item={item} />
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formattedTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>Calculated at next step</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>Calculated at next step</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between font-medium text-lg mb-4">
                  <span>Total</span>
                  <span>{formattedTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 