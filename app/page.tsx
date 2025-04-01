"use client";

import React from 'react';
import Link from 'next/link';
import supabase from './lib/supabase';
import { Product } from './lib/types';
import NewArrivalProductCard from './components/NewArrivalProductCard';
import { useCart } from './lib/cart-context';

// The component is now async to fetch data on the server
export default async function HomePage() {
  const { addItem } = useCart();

  // Fetch the 4 newest products from Supabase
  const { data: newArrivals, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);

  if (error) {
    console.error('Error fetching new arrivals:', error);
    // Handle error appropriately, maybe show a message to the user
  }

  // Sample data for Featured Categories - keep static for now
  const featuredCategories = [
    { name: 'Evening Gowns', image: 'bg-[#f8e8e8]', slug: 'evening-gowns' },
    { name: 'Casual Chic', image: 'bg-[#e8f0f8]', slug: 'casual-chic' },
    { name: 'Business Attire', image: 'bg-[#e8f8ea]', slug: 'business-attire' }
  ];

  // Sample data for Testimonials - keep static for now
  const testimonials = [
    { name: 'Sophie W.', quote: 'The quality of Rashakin\'s pieces is exceptional. I\'ve never received so many compliments on my outfits before.' },
    { name: 'James L.', quote: 'Finding the perfect gift for my wife has never been easier. The customer service team was incredibly helpful throughout the process.' },
    { name: 'Emma T.', quote: 'As someone who values sustainable fashion, I appreciate Rashakin\'s commitment to ethical manufacturing and timeless designs.' }
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
            {featuredCategories.map((category) => (
              <div key={category.name} className="group relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                <div className={`aspect-[3/4] ${category.image}`}></div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 p-4 transition-opacity group-hover:bg-black/40">
                  <h3 className="text-2xl font-serif font-medium text-white text-center drop-shadow-md">{category.name}</h3>
                </div>
                {/* Update Link to use slug for category filtering */}
                <Link href={`/products?category=${category.slug}`} className="absolute inset-0">
                  <span className="sr-only">View {category.name}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals - Now uses fetched data and the client component */}
      <section className="py-20 bg-gray-50">
        <div className="container-padded">
          <h2 className="text-3xl font-serif font-bold text-center mb-3">Spring Collection 2025</h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">Introducing our latest designs that capture the essence of the season</p>
          {newArrivals && newArrivals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                // Use the new client component for each product card
                <NewArrivalProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No new arrivals to display right now.</p>
          )}
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
            {testimonials.map((testimonial, idx) => (
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
          <p className="text-lg text-gray-700 mb-8">Be the first to know about new arrivals, exclusive offers, and style inspiration.</p>
          {/* TODO: Implement actual newsletter signup logic */}
          <form className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="input input-bordered flex-grow px-4 py-3" 
              required 
            />
            <button type="submit" className="btn btn-primary px-8 py-3">Subscribe</button>
          </form>
        </div>
      </section>
    </main>
  );
}