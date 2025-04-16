"use client";

import React from 'react';
import { useCart } from '../lib/cart-context';
import { Product } from '../lib/types';
import Image from 'next/image';

interface NewArrivalProductCardProps {
  product: Product;
}

export default function NewArrivalProductCard({ product }: NewArrivalProductCardProps) {
  const { addItem } = useCart();

  // Basic variant selection (using first available size/color if needed, adjust as necessary)
  // TODO: Implement proper variant selection UI later
  const defaultVariant = {
    size: product.sizes?.[0],
    color: product.colors?.[0],
  };

  const handleAddToCart = () => {
    if (!product) return;
    // Pass the selected variant details (or defaults) along with the product
    addItem(product, 1, defaultVariant.size, defaultVariant.color); 
  };

  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={`Image of ${product.name}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">No Image</div>
        )}
        <div className="absolute top-0 right-0 bg-secondary text-white px-3 py-1 text-sm font-medium">
          New
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-medium text-lg mb-1">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-3">{product.category}</p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">{`£${product.price}`}</span>
          <button 
            onClick={handleAddToCart}
            className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
