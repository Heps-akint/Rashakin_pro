"use client";

import React from 'react';
import Link from 'next/link';
import ProductForm from '../components/ProductForm';

export default function NewProductPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link
          href="/admin/products"
          className="text-blue-600 hover:underline mr-2"
        >
          &larr; Back to Products
        </Link>
        <h1 className="text-2xl font-bold">Add New Product</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <ProductForm isEditing={false} />
      </div>
    </div>
  );
} 