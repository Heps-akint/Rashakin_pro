"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/app/lib/types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { id, name, price, images, category } = product;
  
  // If no images, use a placeholder
  const imageUrl = images && images.length > 0 
    ? images[0] 
    : 'https://via.placeholder.com/300x400?text=No+Image';
  
  // Format price
  const formattedPrice = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(price);
  
  return (
    <div className="group relative overflow-hidden bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link href={`/products/${id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden">
          {/* Use a div with background image instead of <Image> for flexibility with external URLs */}
          <div 
            className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          
          {/* Category tag */}
          <div className="absolute bottom-2 left-2">
            <span className="inline-block bg-gray-800/70 text-white text-xs px-2 py-1 rounded">
              {category}
            </span>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-1">{name}</h3>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-lg font-bold text-gray-900">{formattedPrice}</p>
            <button 
              className="text-primary hover:text-primary/80 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                // Add to wishlist functionality will be added later
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard; 