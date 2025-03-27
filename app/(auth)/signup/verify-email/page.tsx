"use client";

import React from 'react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mx-auto w-20 h-20 bg-green-100 flex items-center justify-center rounded-full">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-10 w-10 text-green-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" 
            />
          </svg>
        </div>
        
        <h2 className="mt-4 text-3xl font-serif font-bold text-gray-900">
          Check your email
        </h2>
        
        <p className="mt-2 text-base text-gray-600">
          We've sent a verification link to your email address.
          Please check your inbox and click the link to complete your registration.
        </p>
        
        <div className="mt-8 space-y-4">
          <p className="text-sm text-gray-500">
            Didn't receive an email? Check your spam folder or
          </p>
          <Link 
            href="/signup" 
            className="inline-flex items-center text-primary hover:text-primary/90 font-medium"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Go back to sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

// Simple arrow icon component
function ArrowLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M10 19l-7-7m0 0l7-7m-7 7h18" 
      />
    </svg>
  );
} 