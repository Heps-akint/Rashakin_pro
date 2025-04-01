"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/auth-context';
import { createClient } from '@/app/lib/supabase/client'; // Use the new client helper
import { Order, OrderStatus } from '@/app/lib/types'; // Assuming Order type is defined here

// Define the Order type locally if not already defined globally
// interface Order {
//   id: number;
//   created_at: string;
//   total_amount: number;
//   status: string;
//   // Add other fields as needed, e.g., order_items
// }

export default function OrderHistoryPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use a memoized client instance for client components
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // Wait until authentication check is complete
    if (isAuthLoading) {
      return;
    }

    // If user is not logged in, redirect to login page
    if (!user) {
      router.push('/login'); // Assuming login page is at /login
      return;
    }

    // Fetch orders for the logged-in user
    const fetchOrders = async () => {
      setIsLoadingOrders(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*') // Select specific columns if needed: 'id, created_at, total_amount, status'
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setOrders(data || []);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError('Failed to load order history. Please try again.');
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user, isAuthLoading, router]);

  // Show loading state while checking auth or fetching orders
  if (isAuthLoading || isLoadingOrders) {
    return (
      <div className="container-padded py-12 text-center">
         <div className="bg-white shadow-md rounded-lg p-8 max-w-md mx-auto">
           <div className="animate-spin mx-auto h-12 w-12 rounded-full border-4 border-primary border-t-transparent"></div>
           <h2 className="text-xl font-medium mt-4">Loading Order History...</h2>
         </div>
      </div>
    );
  }

  // Show error message if fetching failed
  if (error) {
    return (
      <div className="container-padded py-12 text-center">
         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md mx-auto" role="alert">
           <strong className="font-bold">Error:</strong>
           <span className="block sm:inline"> {error}</span>
         </div>
      </div>
    );
  }

  return (
    <div className="container-padded py-12">
      <h1 className="text-3xl font-serif font-bold mb-8">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
           <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
           <Link href="/" className="btn btn-primary">
             Start Shopping
           </Link>
         </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Order #{order.id}</h2>
                  <p className="text-sm text-gray-500">
                    Placed on: {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0">
                   <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                     order.status === OrderStatus.Shipped || order.status === OrderStatus.Delivered ? 'bg-green-100 text-green-800' :
                     order.status === OrderStatus.Pending || order.status === OrderStatus.Processing ? 'bg-yellow-100 text-yellow-800' :
                     order.status === OrderStatus.Cancelled || order.status === OrderStatus.Returned ? 'bg-red-100 text-red-800' :
                     'bg-gray-100 text-gray-800' // Default/fallback
                   }`}>
                     {order.status}
                   </span>
                 </div>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                 <p className="text-lg font-medium">
                   Total: {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(order.total_amount)}
                 </p>
                {/* Placeholder for a 'View Details' link/button */}
                {/* <Link href={`/account/orders/${order.id}`} className="text-primary hover:underline text-sm">
                  View Details
                </Link> */}
              </div>
              {/* Optionally display items summary here later */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
