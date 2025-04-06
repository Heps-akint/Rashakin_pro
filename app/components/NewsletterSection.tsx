'use client';

import React, { useState } from 'react';

/**
 * Client component for handling newsletter subscriptions
 */
export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    try {
      // TODO: Implement actual newsletter signup API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setMessage('Thank you for subscribing!');
      setEmail('');
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      console.error('Newsletter signup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="container-padded max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-serif font-bold mb-6">Stay Updated</h2>
        <p className="text-lg text-gray-700 mb-8">Be the first to know about new arrivals, exclusive offers, and style inspiration.</p>
        <form className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto" onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Enter your email address" 
            className="input input-bordered flex-grow px-4 py-3" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          <button 
            type="submit" 
            className="btn btn-primary px-8 py-3"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        {message && <p className="mt-4 text-primary">{message}</p>}
      </div>
    </section>
  );
}
