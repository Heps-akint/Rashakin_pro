"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import supabase from '@/app/lib/supabase';
import { Product } from '@/app/lib/types';
import { fetchProductsWithFilters, formatCurrency } from '@/app/lib/admin-utils';
import AdminDataTable from '@/app/components/ui/AdminDataTable';
import FilterPanel, { FilterSelect, FilterSearch } from '@/app/components/ui/FilterPanel';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Pagination
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCategories();
    loadProducts();
  }, [filterParam, selectedCategory, currentPage]);
  
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const { products, totalPages } = await fetchProductsWithFilters({
        page: currentPage,
        perPage: itemsPerPage,
        category: selectedCategory,
        lowStock: filterParam === 'low-stock',
        search: searchQuery || null
      });
      
      setProducts(products);
      setTotalPages(totalPages);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);
      
      if (data) {
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
        setCategories(uniqueCategories as string[]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);
        
        if (error) throw error;
        
        // Refresh product list
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  // Prepare table columns
  const columns = [
    { 
      header: 'ID', 
      accessor: (product: Product) => String(product.id)
    },
    { 
      header: 'Product', 
      accessor: (product: Product) => (
        <div className="flex items-center">
          {product.images && product.images[0] ? (
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="h-10 w-10 object-cover rounded mr-3"
            />
          ) : (
            <div className="h-10 w-10 bg-gray-200 rounded mr-3 flex items-center justify-center">
              <span className="text-xs text-gray-500">No img</span>
            </div>
          )}
          <div className="text-sm font-medium text-gray-900">
            {product.name}
          </div>
        </div>
      )
    },
    { 
      header: 'Price', 
      accessor: (product: Product) => formatCurrency(product.price)
    },
    { 
      header: 'Stock', 
      accessor: (product: Product) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          product.stock_quantity < 10
            ? 'bg-red-100 text-red-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {product.stock_quantity}
        </span>
      )
    },
    { 
      header: 'Category', 
      accessor: (product: Product) => product.category || '-'
    },
    { 
      header: 'Actions', 
      accessor: (product: Product) => (
        <>
          <Link
            href={`/admin/products/${product.id}`}
            className="text-blue-600 hover:text-blue-900 mr-3"
          >
            Edit
          </Link>
          <button
            onClick={() => handleDeleteProduct(product.id)}
            className="text-red-600 hover:text-red-900"
          >
            Delete
          </button>
        </>
      )
    },
  ];

  // Category options for filter
  const categoryOptions = categories.map(category => ({
    label: category,
    value: category
  }));

  // Stock options
  const stockOptions = [
    { label: 'Low Stock (< 10)', value: 'low-stock' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {filterParam === 'low-stock' ? 'Low Stock Products' : 'Product Management'}
        </h1>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Add New Product
        </Link>
      </div>
      
      {/* Filters */}
      <FilterPanel onSubmit={handleSearch}>
        <FilterSelect
          label="Filter by Category"
          value={selectedCategory || ''}
          onChange={(value) => {
            setSelectedCategory(value || null);
            setCurrentPage(1);
          }}
          options={categoryOptions}
          placeholder="All Categories"
        />
        
        <FilterSelect
          label="Filter by Stock"
          value={filterParam || ''}
          onChange={(value) => {
            if (value) {
              router.push(`/admin/products?filter=${value}`);
            } else {
              router.push('/admin/products');
            }
            setCurrentPage(1);
          }}
          options={stockOptions}
          placeholder="All Products"
        />
        
        <FilterSearch
          label="Search Products"
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={() => {
            setCurrentPage(1);
            loadProducts();
          }}
          placeholder="Search by name or description"
        />
      </FilterPanel>
      
      {/* Product Table */}
      <AdminDataTable
        columns={columns}
        data={products}
        keyField="id"
        isLoading={isLoading}
        emptyMessage={
          <div>
            <p className="text-lg text-gray-600 mb-4">No products found</p>
            <Link
              href="/admin/products/new"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Add New Product
            </Link>
          </div>
        }
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
} 