"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import supabase from '@/app/lib/supabase';
import ProductForm from '../components/ProductForm';
import { Product } from '@/app/lib/types';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) {
          throw new Error('Product ID is missing');
        }

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error('Product not found');
        }

        setProduct(data);
      } catch (error: any) {
        console.error('Error fetching product:', error);
        setError(error.message || 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <p>{error}</p>
        </div>
        <Link href="/admin/products" className="text-blue-600 hover:underline">
          &larr; Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-6">
          <p>Product not found</p>
        </div>
        <Link href="/admin/products" className="text-blue-600 hover:underline">
          &larr; Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link
          href="/admin/products"
          className="text-blue-600 hover:underline mr-2"
        >
          &larr; Back to Products
        </Link>
        <h1 className="text-2xl font-bold">Edit Product: {product.name}</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <ProductForm product={product} isEditing={true} />
      </div>
    </div>
  );
} 