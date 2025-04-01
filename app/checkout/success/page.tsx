"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/app/lib/cart-context';

interface OrderData {
  id: number;
  total: number;
  items: {
    product_name: string;
    price: number;
    quantity: number;
    size: string | null;
    color: string | null;
  }[];
  shipping: any;
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  
  useEffect(() => {
    if (!sessionId) {
      setError('No order information found');
      setIsLoading(false);
      return;
    }
    
    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/checkout/session?session_id=${sessionId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify payment');
        }
        
        setOrderData(data.order);
        clearCart();
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Unable to verify payment status');
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyPayment();
  }, [sessionId]);
  
  if (isLoading) {
    return (
      <div className="container-padded py-12 text-center">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md mx-auto">
          <div className="animate-spin mx-auto h-12 w-12 rounded-full border-4 border-primary border-t-transparent"></div>
          <h2 className="text-xl font-medium mt-4">Verifying your order...</h2>
          <p className="text-gray-500 mt-2">Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }
  
  if (error || !orderData) {
    return (
      <div className="container-padded py-12 text-center">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md mx-auto">
          <div className="bg-red-100 text-red-600 p-3 rounded-full inline-flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium mt-4">There was a problem</h2>
          <p className="text-gray-500 mt-2">{error || 'Unable to retrieve order information'}</p>
          <div className="mt-6">
            <Link href="/" className="btn btn-primary">
              Return to home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Format the total price
  const formattedTotal = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(orderData.total);
  
  return (
    <div className="container-padded py-12">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="bg-green-100 text-green-600 p-3 rounded-full inline-flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-serif font-bold mt-4">Order Confirmed!</h1>
          <p className="text-gray-600 mt-2">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
        </div>
        
        <div className="border-t border-gray-200 pt-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between mb-6">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-sm font-medium text-gray-500">Order Number</h3>
              <p className="mt-1 font-medium">#{orderData.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Order Total</h3>
              <p className="mt-1 font-medium">{formattedTotal}</p>
            </div>
          </div>
          
          <h3 className="font-medium mb-4">Order Items</h3>
          <div className="space-y-3 mb-6">
            {orderData.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-gray-500">
                    {item.size && `Size: ${item.size}`}
                    {item.size && item.color && ', '}
                    {item.color && `Color: ${item.color}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {new Intl.NumberFormat('en-GB', {
                      style: 'currency',
                      currency: 'GBP',
                    }).format(item.price)}
                  </p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-gray-600 mb-6">
            We've sent a confirmation email to your email address with all the order details.
          </p>
          <div className="space-x-4">
            <Link href="/" className="btn btn-primary">
              Continue Shopping
            </Link>
            <Link href="/account/orders" className="btn btn-outline">
              View Order History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 