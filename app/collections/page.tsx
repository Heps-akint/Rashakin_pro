import React from 'react';
import Link from 'next/link';

export default function CollectionsPage() {
  const collections = [
    {
      name: 'Evening Gowns',
      description: 'Elegant and sophisticated designs for special occasions',
      image: '/collections/evening-gowns.jpg',
      slug: 'evening-gowns'
    },
    {
      name: 'Casual Chic',
      description: 'Effortless everyday style with a touch of elegance',
      image: '/collections/casual-chic.jpg',
      slug: 'casual-chic'
    },
    {
      name: 'Business Attire',
      description: 'Professional yet fashionable looks for the workplace',
      image: '/collections/business-attire.jpg',
      slug: 'business-attire'
    }
  ];

  return (
    <div className="container-padded py-12">
      <h1 className="text-4xl font-serif font-bold mb-8">Our Collections</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {collections.map((collection) => (
          <Link
            key={collection.slug}
            href={`/products?category=${collection.slug}`}
            className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div className="aspect-[3/4] bg-gray-100">
              {/* Image would be added here */}
            </div>
            <div className="absolute inset-0 bg-black/30 p-6 flex flex-col justify-end transition-opacity group-hover:bg-black/40">
              <h2 className="text-2xl font-serif font-medium text-white mb-2">{collection.name}</h2>
              <p className="text-gray-200">{collection.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
