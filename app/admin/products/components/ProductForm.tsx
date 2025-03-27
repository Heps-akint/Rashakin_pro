"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/app/lib/supabase';
import { Product } from '@/app/lib/types';

interface ProductFormProps {
  product?: Product;
  isEditing: boolean;
}

export default function ProductForm({ product, isEditing }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    images: [],
    sizes: [],
    colors: [],
    stock_quantity: 0,
    category: '',
    tags: [],
  });
  
  // Size and color input state
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newTag, setNewTag] = useState('');
  
  // Available categories for dropdown
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  useEffect(() => {
    // If editing, populate form with product data
    if (isEditing && product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        images: product.images || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        stock_quantity: product.stock_quantity || 0,
        category: product.category || '',
        tags: product.tags || [],
      });
    }
    
    // Fetch available categories
    fetchCategories();
  }, [isEditing, product]);
  
  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);
      
      if (data) {
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
        setAvailableCategories(uniqueCategories as string[]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric inputs
    if (name === 'price' || name === 'stock_quantity') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  // Handle array-type inputs (sizes, colors, tags)
  const handleAddSize = () => {
    if (newSize && !formData.sizes?.includes(newSize)) {
      setFormData({
        ...formData,
        sizes: [...(formData.sizes || []), newSize],
      });
      setNewSize('');
    }
  };
  
  const handleRemoveSize = (size: string) => {
    setFormData({
      ...formData,
      sizes: formData.sizes?.filter(s => s !== size) || [],
    });
  };
  
  const handleAddColor = () => {
    if (newColor && !formData.colors?.includes(newColor)) {
      setFormData({
        ...formData,
        colors: [...(formData.colors || []), newColor],
      });
      setNewColor('');
    }
  };
  
  const handleRemoveColor = (color: string) => {
    setFormData({
      ...formData,
      colors: formData.colors?.filter(c => c !== color) || [],
    });
  };
  
  const handleAddTag = () => {
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag],
      });
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || [],
    });
  };
  
  // Handle image uploads
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setImageUploadLoading(true);
    setError(null);
    
    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `product-images/${fileName}`;
        
        // Upload image to Supabase Storage
        const { error: uploadError, data } = await supabase.storage
          .from('images')
          .upload(filePath, file);
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
        
        if (urlData.publicUrl) {
          uploadedUrls.push(urlData.publicUrl);
        }
      }
      
      // Update form with new images
      setFormData({
        ...formData,
        images: [...(formData.images || []), ...uploadedUrls],
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      setError('Failed to upload images. Please try again.');
    } finally {
      setImageUploadLoading(false);
    }
  };
  
  const handleRemoveImage = (imageUrl: string) => {
    setFormData({
      ...formData,
      images: formData.images?.filter(img => img !== imageUrl) || [],
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate form data
      if (!formData.name?.trim()) {
        throw new Error('Product name is required');
      }
      
      if (!formData.price || formData.price <= 0) {
        throw new Error('Price must be greater than 0');
      }
      
      // Prepare data for submission
      const productData = {
        name: formData.name,
        description: formData.description || '',
        price: formData.price,
        images: formData.images || [],
        sizes: formData.sizes || [],
        colors: formData.colors || [],
        stock_quantity: formData.stock_quantity || 0,
        category: formData.category || null,
        tags: formData.tags || [],
        updated_at: new Date().toISOString(),
      };
      
      let result;
      
      if (isEditing && product) {
        // Update existing product
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
      } else {
        // Add created_at for new products
        result = await supabase
          .from('products')
          .insert([{
            ...productData,
            created_at: new Date().toISOString(),
          }]);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      // Redirect to product list on success
      router.push('/admin/products');
      router.refresh();
    } catch (error: any) {
      console.error('Error saving product:', error);
      setError(error.message || 'Failed to save product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Product Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price ($)*
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700">
              Stock Quantity
            </label>
            <input
              type="number"
              id="stock_quantity"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleInputChange}
              min="0"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              list="categories"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
            <datalist id="categories">
              {availableCategories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </div>
        </div>
        
        {/* Variant Information & Images */}
        <div className="space-y-6">
          {/* Images */}
          <div>
            <h3 className="text-lg font-medium mb-2">Product Images</h3>
            
            <div className="mt-1 border border-gray-300 rounded-md p-4">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {formData.images?.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Product ${index + 1}`}
                      className="h-24 w-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(imageUrl)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              
              <label className="block">
                <span className="sr-only">Choose product images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={imageUploadLoading}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </label>
              
              {imageUploadLoading && (
                <div className="mt-2 flex items-center text-sm text-blue-500">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </div>
              )}
            </div>
          </div>
          
          {/* Sizes */}
          <div>
            <h3 className="text-lg font-medium mb-2">Sizes</h3>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.sizes?.map((size) => (
                <span
                  key={size}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {size}
                  <button
                    type="button"
                    onClick={() => handleRemoveSize(size)}
                    className="ml-1.5 h-3.5 w-3.5 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 inline-flex items-center justify-center"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex">
              <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                placeholder="Add a size (e.g. S, M, L)"
                className="flex-1 p-2 border border-gray-300 rounded-l-md"
              />
              <button
                type="button"
                onClick={handleAddSize}
                className="bg-gray-200 hover:bg-gray-300 px-4 rounded-r-md"
              >
                Add
              </button>
            </div>
          </div>
          
          {/* Colors */}
          <div>
            <h3 className="text-lg font-medium mb-2">Colors</h3>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.colors?.map((color) => (
                <span
                  key={color}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {color}
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(color)}
                    className="ml-1.5 h-3.5 w-3.5 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 inline-flex items-center justify-center"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex">
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="Add a color (e.g. Red, Blue)"
                className="flex-1 p-2 border border-gray-300 rounded-l-md"
              />
              <button
                type="button"
                onClick={handleAddColor}
                className="bg-gray-200 hover:bg-gray-300 px-4 rounded-r-md"
              >
                Add
              </button>
            </div>
          </div>
          
          {/* Tags */}
          <div>
            <h3 className="text-lg font-medium mb-2">Tags</h3>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1.5 h-3.5 w-3.5 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 inline-flex items-center justify-center"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                className="flex-1 p-2 border border-gray-300 rounded-l-md"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-gray-200 hover:bg-gray-300 px-4 rounded-r-md"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Submit Buttons */}
      <div className="flex space-x-4 pt-4 border-t">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md shadow-sm flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            isEditing ? 'Update Product' : 'Create Product'
          )}
        </button>
        
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="border border-gray-300 text-gray-700 py-2 px-6 rounded-md shadow-sm hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
} 