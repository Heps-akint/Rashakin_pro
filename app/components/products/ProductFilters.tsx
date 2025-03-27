"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/app/hooks/useDebounce';

const CATEGORIES = [
  'All',
  'Dresses',
  'Tops',
  'Pants',
  'Skirts',
  'Outerwear',
  'Accessories'
];

const SORT_OPTIONS = [
  { label: 'Newest', value: 'created_at:desc' },
  { label: 'Price: Low to High', value: 'price:asc' },
  { label: 'Price: High to Low', value: 'price:desc' },
  { label: 'Name: A-Z', value: 'name:asc' },
  { label: 'Name: Z-A', value: 'name:desc' }
];

const ProductFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get current filter values from URL
  const initialCategory = searchParams.get('category') || 'All';
  const initialSortValue = `${searchParams.get('sortBy') || 'created_at'}:${searchParams.get('sortOrder') || 'desc'}`;
  const initialMinPrice = searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';
  const initialSearch = searchParams.get('search') || '';
  
  // Component state
  const [category, setCategory] = useState(initialCategory);
  const [sortValue, setSortValue] = useState(initialSortValue);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [search, setSearch] = useState(initialSearch);
  
  // Debounce search input to avoid too many URL updates while typing
  const debouncedSearch = useDebounce(search, 500);
  
  // Update the URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Only add category param if it's not "All"
    if (category !== 'All') {
      params.set('category', category);
    }
    
    // Split sort value into sortBy and sortOrder
    const [sortBy, sortOrder] = sortValue.split(':');
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    
    // Add price range filters if provided
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    
    // Add search term if provided
    if (debouncedSearch) params.set('search', debouncedSearch);
    
    // Reset to page 1 when filters change
    params.set('page', '1');
    
    // Update URL
    router.push(`${pathname}?${params.toString()}`);
  }, [category, sortValue, minPrice, maxPrice, debouncedSearch, pathname, router]);
  
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        
        {/* Price range filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Range
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min="0"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
            />
          </div>
        </div>
        
        {/* Sort options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            value={sortValue}
            onChange={(e) => setSortValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Clear filters button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => {
            setCategory('All');
            setSortValue('created_at:desc');
            setMinPrice('');
            setMaxPrice('');
            setSearch('');
          }}
          className="text-sm text-primary hover:text-primary/80"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
};

export default ProductFilters; 