import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-serif font-bold text-primary mb-6">404</h1>
        <h2 className="text-2xl font-medium mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          We couldn't find the page you were looking for. It might have been removed, renamed, or doesn't exist.
        </p>
        <div className="space-y-4">
          <Link href="/" className="btn btn-primary block">
            Go Back Home
          </Link>
          <Link href="/products" className="text-primary hover:text-primary/90 inline-block">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
} 