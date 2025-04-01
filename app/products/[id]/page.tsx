import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductCard from '@/app/components/ui/ProductCard';
import ProductInteraction from './ProductInteraction';
import { Product } from '@/app/lib/types';

// Metadata
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const { product } = await getProduct(params.id);
    
    return {
      title: `${product.name} - Rashakin`,
      description: product.description.substring(0, 160) + '...',
    };
  } catch (error) {
    return {
      title: 'Product Not Found - Rashakin',
      description: 'The requested product could not be found.',
    };
  }
}

// Function to fetch a product by ID
async function getProduct(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${id}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }
  
  return response.json();
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  try {
    const { product, relatedProducts } = await getProduct(params.id);
    
    // Format price
    const formattedPrice = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(product.price);
    
    return (
      <div className="container-padded py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-primary">Shop</Link>
          <span className="mx-2">/</span>
          <Link href={`/products?category=${product.category}`} className="hover:text-primary">
            {product.category}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{product.name}</span>
        </div>
        
        {/* Product details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Product images */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <div
                  className="w-full h-full bg-center bg-cover"
                  style={{ backgroundImage: `url(${product.images[0]})` }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                  No Image Available
                </div>
              )}
            </div>
            
            {/* Thumbnail gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image: string, index: number) => (
                  <div 
                    key={index} 
                    className="aspect-square bg-gray-100 rounded-md overflow-hidden cursor-pointer"
                  >
                    <div
                      className="w-full h-full bg-center bg-cover"
                      style={{ backgroundImage: `url(${image})` }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Product info */}
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">{product.name}</h1>
            <p className="text-2xl font-bold text-primary mb-4">{formattedPrice}</p>
            
            {/* Product description */}
            <div className="prose prose-gray mb-6">
              <p>{product.description}</p>
            </div>
            
            {/* Replace static variant selection and AddToCartButton with the client component */}
            <ProductInteraction product={product} />

            {/* Product meta */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <p><span className="font-medium text-gray-700">Category:</span> {product.category}</p>
                {product.tags && product.tags.length > 0 && (
                  <p>
                    <span className="font-medium text-gray-700">Tags:</span>{' '}
                    {product.tags.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Related products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif font-bold mb-6">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct: Product) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    notFound();
  }
} 