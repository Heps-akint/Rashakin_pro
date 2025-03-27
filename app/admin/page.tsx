"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/app/lib/supabase';
import { checkIsAdmin } from '@/app/lib/admin-utils';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    recentOrders: 0,
    lowStockProducts: 0
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login?redirect=/admin');
          return;
        }

        // Check if user is an admin
        const isUserAdmin = await checkIsAdmin();
        if (!isUserAdmin) {
          router.push('/');
          return;
        }

        setIsAdmin(true);
        fetchDashboardStats();
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/login?redirect=/admin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [router]);

  const fetchDashboardStats = async () => {
    try {
      // Fetch product stats
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Fetch low stock products
      const { count: lowStockProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lt('stock_quantity', 10);

      // Fetch order stats
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Fetch recent orders (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count: recentOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      setStats({
        totalProducts: totalProducts || 0,
        lowStockProducts: lowStockProducts || 0,
        totalOrders: totalOrders || 0,
        recentOrders: recentOrders || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Router will redirect, this prevents flash of unauthorized content
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts} 
          icon="📦" 
          linkTo="/admin/products"
        />
        <StatCard 
          title="Low Stock Products" 
          value={stats.lowStockProducts} 
          icon="⚠️" 
          linkTo="/admin/products?filter=low-stock"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon="🛒" 
          linkTo="/admin/orders"
        />
        <StatCard 
          title="Recent Orders (7d)" 
          value={stats.recentOrders} 
          icon="📅" 
          linkTo="/admin/orders?filter=recent"
        />
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/admin/products/new"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Add New Product
          </Link>
          <Link 
            href="/admin/orders?filter=pending"
            className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded"
          >
            View Pending Orders
          </Link>
        </div>
      </div>
      
      {/* Admin Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NavigationCard 
          title="Product Management" 
          description="Add, edit, and manage your product inventory"
          icon="📦"
          linkTo="/admin/products"
        />
        <NavigationCard 
          title="Order Management" 
          description="View and process customer orders"
          icon="🛒"
          linkTo="/admin/orders"
        />
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, linkTo }: { 
  title: string;
  value: number;
  icon: string;
  linkTo: string;
}) {
  return (
    <Link
      href={linkTo}
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </Link>
  );
}

// Navigation Card Component
function NavigationCard({ title, description, icon, linkTo }: {
  title: string;
  description: string;
  icon: string;
  linkTo: string;
}) {
  return (
    <Link
      href={linkTo}
      className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center mb-4">
        <span className="text-3xl mr-4">{icon}</span>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
} 