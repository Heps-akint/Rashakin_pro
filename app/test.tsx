"use client";

import React from 'react';

export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-serif text-primary mb-4">Tailwind CSS Test</h1>
      <p className="text-gray-700 mb-4">
        This page tests if Tailwind CSS classes are being properly applied.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary text-white p-4 rounded">Primary Color</div>
        <div className="bg-secondary text-white p-4 rounded">Secondary Color</div>
        <div className="bg-accent text-white p-4 rounded">Accent Color</div>
      </div>
    </div>
  );
} 