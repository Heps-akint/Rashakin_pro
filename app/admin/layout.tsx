"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/app/lib/supabase';
import { ADMIN_EMAIL, checkIsAdmin } from '@/app/lib/admin-utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const validateAdmin = async () => {
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
        setUserName(session.user.email?.split('@')[0] || 'Admin');
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/login?redirect=/admin');
      } finally {
        setIsLoading(false);
      }
    };

    validateAdmin();
  }, [router]);

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

  // Navigation items
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Products', path: '/admin/products', icon: '📦' },
    { name: 'Orders', path: '/admin/orders', icon: '🛒' },
  ];

  const isActive = (path: string) => 
    pathname === path || (path !== '/admin' && pathname?.startsWith(path));

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b flex items-center">
          <h2 className="text-2xl font-semibold">Rashakin Admin</h2>
        </div>
        
        <nav className="p-4 flex-grow">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                    isActive(item.path)
                      ? 'bg-gray-100 text-blue-600 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center mb-4 p-2 bg-gray-50 rounded-lg">
            <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2">
              {userName?.charAt(0).toUpperCase()}
            </div>
            <div className="text-sm">
              <p className="font-medium">{userName}</p>
              <p className="text-xs text-gray-500">{ADMIN_EMAIL}</p>
            </div>
          </div>
          
          <Link
            href="/"
            className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="mr-3">🏠</span>
            Back to Site
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors w-full"
          >
            <span className="mr-3">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
} 