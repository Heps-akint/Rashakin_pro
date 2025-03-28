"use client";

import React from 'react';
import Link from 'next/link';
import { useCart } from './lib/cart-context';
import { Product } from './lib/types';

export default function HomePage() {
  const { addItem } = useCart();

  // Sample products data
  const newArrivals: Product[] = [
    { 
      id: 1, 
      name: 'Serene Silk Blouse', 
      price: 129.99, 
      category: 'Tops', 
      images: ['/products/silk-blouse.jpg'],
      description: 'Elegant silk blouse with a relaxed fit, perfect for any occasion',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['White', 'Ivory', 'Black'],
      stock_quantity: 25,
      tags: ['silk', 'blouse', 'luxury'],
      created_at: '2025-01-15T00:00:00Z',
      updated_at: '2025-01-15T00:00:00Z'
    },
    { 
      id: 2, 
      name: 'Meridian Maxi Dress', 
      price: 189.99, 
      category: 'Dresses', 
      images: ['/products/maxi-dress.jpg'],
      description: 'Flowing maxi dress with an elegant silhouette and feminine details',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Navy', 'Emerald', 'Black'],
      stock_quantity: 18,
      tags: ['dress', 'maxi', 'evening'],
      created_at: '2025-01-20T00:00:00Z',
      updated_at: '2025-01-20T00:00:00Z'
    },
    { 
      id: 3, 
      name: 'Cascade Linen Pants', 
      price: 149.99, 
      category: 'Pants', 
      images: ['/products/linen-pants.jpg'],
      description: 'Breathable linen pants with a wide-leg cut for ultimate comfort',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Beige', 'White', 'Sage'],
      stock_quantity: 22,
      tags: ['pants', 'linen', 'summer'],
      created_at: '2025-02-05T00:00:00Z',
      updated_at: '2025-02-05T00:00:00Z'
    },
    { 
      id: 4, 
      name: 'Aurora Evening Gown', 
      price: 249.99, 
      category: 'Dresses', 
      images: ['/products/evening-gown.jpg'],
      description: 'Stunning evening gown with intricate detailing and a flattering cut',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Midnight Blue', 'Burgundy', 'Black'],
      stock_quantity: 15,
      tags: ['gown', 'evening', 'formal'],
      created_at: '2025-02-10T00:00:00Z',
      updated_at: '2025-02-10T00:00:00Z'
    }
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-24">
        <div className="container-padded">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 text-balance">
              Elevate Your Style with Rashakin
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              Timeless elegance meets contemporary fashion in our exclusive 2025 collection
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/products" className="btn btn-primary px-8 py-3 text-lg">
                Shop Collection
              </Link>
              <Link href="/about" className="btn bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 px-8 py-3 text-lg">
                Our Heritage
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20">
        <div className="container-padded">
          <h2 className="text-3xl font-serif font-bold text-center mb-3">Curated Collections</h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">Discover our carefully crafted categories designed to complement your personal style</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Evening Gowns', image: 'bg-[#f8e8e8]' },
              { name: 'Casual Chic', image: 'bg-[#e8f0f8]' },
              { name: 'Business Attire', image: 'bg-[#e8f8ea]' }
            ].map((category) => (
              <div key={category.name} className="group relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                <div className={`aspect-[3/4] ${category.image}`}></div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 p-4 transition-opacity group-hover:bg-black/40">
                  <h3 className="text-2xl font-serif font-medium text-white text-center drop-shadow-md">{category.name}</h3>
                </div>
                <Link href={`/products?category=${category.name.toLowerCase().replace(' ', '-')}`} className="absolute inset-0">
                  <span className="sr-only">View {category.name}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20 bg-gray-50">
        <div className="container-padded">
          <h2 className="text-3xl font-serif font-bold text-center mb-3">Spring Collection 2025</h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">Introducing our latest designs that capture the essence of the season</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product, idx) => (
              <div key={idx} className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                <div className={`aspect-[4/5] bg-[#f0f0f0] relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 bg-secondary text-white px-3 py-1 text-sm font-medium">
                    New
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                </div>
                <div className="p-5">
                  <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-3">{product.category}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">{`£${product.price}`}</span>
                    <button 
                      onClick={() => addItem(product, 1)}
                      className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/products" className="btn btn-primary px-8 py-3">
              Explore Full Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container-padded">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">Our Customers Love Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sophie W.', quote: 'The quality of Rashakin\'s pieces is exceptional. I\'ve never received so many compliments on my outfits before.' },
              { name: 'James L.', quote: 'Finding the perfect gift for my wife has never been easier. The customer service team was incredibly helpful throughout the process.' },
              { name: 'Emma T.', quote: 'As someone who values sustainable fashion, I appreciate Rashakin\'s commitment to ethical manufacturing and timeless designs.' }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col h-full">
                  <div className="mb-4 text-secondary">
                    {/* Star rating */}
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className="text-xl">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 italic mb-4 flex-grow">
                    {testimonial.quote}
                  </p>
                  <p className="text-gray-600">{testimonial.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container-padded max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold mb-6">Stay Updated</h2>
          <p className="text-lg text-gray-700 mb-8">
            Subscribe to our newsletter to receive updates on new arrivals, special offers, and more.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
            <button type="submit" className="btn btn-primary whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}