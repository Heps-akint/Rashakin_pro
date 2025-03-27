import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AddToCartButton from './AddToCartButton';
import ProductCard from '@/app/components/ui/ProductCard';
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
            
            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string) => (
                    <button 
                      key={size}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color: string) => (
                    <button 
                      key={color}
                      className="h-8 w-8 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Stock status */}
            <div className="mb-6">
              <p className={`text-sm ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock_quantity > 0 
                  ? `In Stock (${product.stock_quantity} available)` 
                  : 'Out of Stock'}
              </p>
            </div>
            
            {/* Add to cart button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <AddToCartButton product={product} />
              
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md flex items-center justify-center text-gray-700 hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Add to Wishlist
              </button>
            </div>
            
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