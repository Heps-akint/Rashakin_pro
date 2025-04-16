"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import supabase from '@/app/lib/supabase';
import { Order, OrderStatus } from '@/app/lib/types';
import { 
  formatDate, 
  formatCurrency, 
  getStatusBadgeClass, 
  getPaymentStatusBadgeClass,
  ORDER_STATUSES
} from '@/app/lib/admin-utils';

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(OrderStatus.Pending);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      if (!id) {
        throw new Error('Order ID is missing');
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Order not found');
      }

      setOrder(data);
      setSelectedStatus(data.status);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      setError(error.message || 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async () => {
    if (!order || !selectedStatus) return;
    
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: selectedStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setOrder({
        ...order,
        status: selectedStatus,
        updated_at: new Date().toISOString(),
      });
      
      alert('Order status updated successfully');
    } catch (error: any) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <p>{error}</p>
        </div>
        <Link href="/admin/orders" className="text-blue-600 hover:underline">
          &larr; Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-6">
          <p>Order not found</p>
        </div>
        <Link href="/admin/orders" className="text-blue-600 hover:underline">
          &larr; Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/admin/orders" className="text-blue-600 hover:underline mb-2 inline-block">
            &larr; Back to Orders
          </Link>
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
        </div>
        <div className="flex items-center">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(order.status)} mr-2`}>
            {order.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusBadgeClass(order.payment_status)}`}>
            {order.payment_status}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="font-medium">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="font-medium">{formatDate(order.updated_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <p className={`font-medium ${order.payment_status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                {order.payment_status}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-medium">{formatCurrency(order.total_amount)}</p>
            </div>
          </div>
          
          {/* Update Status */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-md font-medium mb-2">Update Order Status</h3>
            <div className="flex items-center">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                className="p-2 border border-gray-300 rounded mr-2 flex-grow"
                disabled={isUpdating}
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                onClick={updateOrderStatus}
                disabled={isUpdating || selectedStatus === order.status}
                className={`px-4 py-2 rounded ${
                  isUpdating || selectedStatus === order.status
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
          <div className="mb-4">
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">{order.customer_name || 'Guest'}</p>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{order.customer_email || 'N/A'}</p>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{order.customer_phone || 'N/A'}</p>
          </div>
          {order.customer_id && (
            <div>
              <p className="text-sm text-gray-600">Customer ID</p>
              <p className="font-medium">{order.customer_id}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Order Items */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <h2 className="text-lg font-semibold p-6 border-b">Order Items</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {order.order_items.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {item.product_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.size && `Size: ${item.size}`}
                    {item.size && item.color && ' | '}
                    {item.color && `Color: ${item.color}`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(item.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium">
                Total:
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                {formatCurrency(order.total_amount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {/* Shipping and Billing Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
          <p className="mb-1">{order.shipping_address.street}</p>
          <p className="mb-1">
            {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
          </p>
          <p>{order.shipping_address.country}</p>
        </div>
        
        {/* Billing Address */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Billing Address</h2>
          <p className="mb-1">{order.billing_address.street}</p>
          <p className="mb-1">
            {order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}
          </p>
          <p>{order.billing_address.country}</p>
        </div>
      </div>
      
      {/* Payment Information */}
      {(order.stripe_session_id || order.stripe_payment_intent_id) && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
          {order.stripe_session_id && (
            <div className="mb-2">
              <p className="text-sm text-gray-600">Stripe Session ID</p>
              <p className="font-mono text-sm">{order.stripe_session_id}</p>
            </div>
          )}
          {order.stripe_payment_intent_id && (
            <div>
              <p className="text-sm text-gray-600">Stripe Payment Intent ID</p>
              <p className="font-mono text-sm">{order.stripe_payment_intent_id}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 