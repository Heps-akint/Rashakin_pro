import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import ProductCard from '@/app/components/ui/ProductCard';
import Pagination from '@/app/components/ui/Pagination';
import ProductFilters from '@/app/components/products/ProductFilters';
import { Product } from '@/app/lib/types';

// Metadata for SEO
export const metadata: Metadata = {
  title: 'Shop - Rashakin',
  description: 'Browse our collection of stylish clothing and accessories.',
};

// Function to fetch products from API
async function getProducts(searchParams: any) {
  // Convert search params to query string
  const queryString = new URLSearchParams(searchParams).toString();
  
  // Fetch products from API
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products?${queryString}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  
  return response.json();
}

// Define interface for page props
interface ProductsPageProps {
  searchParams: {
    category?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
    limit?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Get current page from query params or default to 1
  const currentPage = parseInt(searchParams.page || '1');
  
  // Fetch products and pagination data
  const { products, total, totalPages } = await getProducts(searchParams);
  
  // Display message if no products found
  const noProductsFound = products.length === 0;
  
  return (
    <div className="container-padded py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold mb-2">
          {searchParams.category || 'All Products'}
        </h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <span>Shop</span>
          {searchParams.category && (
            <>
              <span className="mx-2">/</span>
              <span>{searchParams.category}</span>
            </>
          )}
        </div>
      </div>
      
      {/* Filters Section */}
      <ProductFilters />
      
      {/* Products Grid */}
      {noProductsFound ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg">
          <h2 className="text-xl font-medium text-gray-700 mb-2">No products found</h2>
          <p className="text-gray-500 mb-4">
            Try adjusting your filters or search query.
          </p>
          <Link 
            href="/products"
            className="btn btn-primary"
          >
            View all products
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </>
      )}
    </div>
  );
} 