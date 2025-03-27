"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FormInput from '@/app/components/ui/FormInput';
import Button from '@/app/components/ui/Button';
import supabase from '@/app/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check if URL contains hash parameters from Supabase auth
    const hash = window.location.hash;
    if (!hash) {
      setResetError('Invalid or expired password reset link');
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });
      
      if (error) {
        setResetError(error.message || 'Failed to reset password');
      } else {
        setIsSuccess(true);
      }
    } catch (error) {
      setResetError('An unexpected error occurred');
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        {!isSuccess ? (
          <>
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-serif font-bold text-gray-900">
                Reset your password
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Enter your new password below
              </p>
            </div>
            
            {resetError && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{resetError}</span>
              </div>
            )}
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <FormInput
                id="password"
                name="password"
                type="password"
                label="New Password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="new-password"
                required
              />
              
              <FormInput
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                autoComplete="new-password"
                required
              />
              
              <div className="pt-2">
                <Button
                  type="submit"
                  fullWidth
                  isLoading={isLoading}
                >
                  Reset Password
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 flex items-center justify-center rounded-full">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-green-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            
            <h2 className="mt-4 text-2xl font-serif font-bold text-gray-900">
              Password Reset Complete
            </h2>
            
            <p className="mt-2 text-base text-gray-600">
              Your password has been successfully reset.
            </p>
            
            <div className="mt-8">
              <Button
                onClick={() => router.push('/login')}
                fullWidth
              >
                Sign In with New Password
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 