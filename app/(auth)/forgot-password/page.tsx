"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import FormInput from '@/app/components/ui/FormInput';
import Button from '@/app/components/ui/Button';
import { useAuth } from '@/app/lib/auth-context';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    } 
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetError('');
    
    if (!validateEmail()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        setResetError(error.message || 'Failed to send password reset email');
      } else {
        setIsEmailSent(true);
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
        {!isEmailSent ? (
          <>
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-serif font-bold text-gray-900">
                Reset your password
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>
            
            {resetError && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{resetError}</span>
              </div>
            )}
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <FormInput
                id="email"
                name="email"
                type="email"
                label="Email Address"
                value={email}
                onChange={handleEmailChange}
                error={emailError}
                autoComplete="email"
                required
              />
              
              <div className="pt-2">
                <Button
                  type="submit"
                  fullWidth
                  isLoading={isLoading}
                >
                  Send Reset Link
                </Button>
              </div>
            </form>
            
            <div className="mt-4 text-center">
              <Link 
                href="/login" 
                className="text-sm text-primary hover:text-primary/90"
              >
                Back to sign in
              </Link>
            </div>
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
              Check your email
            </h2>
            
            <p className="mt-2 text-base text-gray-600">
              We've sent a password reset link to:<br />
              <span className="font-medium">{email}</span>
            </p>
            
            <p className="mt-6 text-sm text-gray-500">
              Didn't receive an email? Check your spam folder or 
              <button 
                onClick={() => setIsEmailSent(false)}
                className="text-primary hover:text-primary/90 ml-1 underline"
              >
                try again
              </button>
            </p>
            
            <div className="mt-8">
              <Link 
                href="/login" 
                className="text-primary hover:text-primary/90 font-medium"
              >
                Return to sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 