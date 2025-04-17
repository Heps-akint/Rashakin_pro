"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/lib/auth-context';
import { useCart } from '@/app/lib/cart-context';

const Header = () => {
  const { user, signOut } = useAuth();
  const { openCart, totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  
  // Refs for dropdown menus to handle click outside
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  // Handler for signing out
  const handleSignOut = useCallback(async () => {
    try {
      setSignOutError(null);
      await signOut();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
      setSignOutError('Failed to sign out. Please try again.');
    }
  }, [signOut]);
  
  // Toggle user menu with proper accessibility
  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen(prev => !prev);
  }, []);
  
  // Toggle mobile menu with proper accessibility
  const toggleMobileMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);
  
  // Open cart with optimization
  const handleOpenCart = useCallback(() => {
    setIsMenuOpen(false);
    openCart();
  }, [openCart]);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close user menu when clicking outside
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      
      // Close mobile menu when clicking outside
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Close menus on Escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-padded flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="font-serif text-2xl font-bold text-primary">
          Rashakin
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8" aria-label="Main navigation">
          <Link href="/products" className="text-gray-600 hover:text-primary font-medium">
            Shop
          </Link>
          <Link href="/products?category=new" className="text-gray-600 hover:text-primary font-medium">
            New Arrivals
          </Link>
          <Link href="/collections" className="text-gray-600 hover:text-primary font-medium">
            Collections
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-primary font-medium">
            About
          </Link>
        </nav>
        
        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                className="text-gray-600 hover:text-primary flex items-center"
                onClick={toggleUserMenu}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
                aria-label="User account menu"
              >
                <span className="sr-only">Account</span>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>
              
              {isUserMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium truncate">{user.email}</p>
                  </div>
                  <Link 
                    href="/account" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                    role="menuitem"
                  >
                    My Account
                  </Link>
                  <Link 
                    href="/account/orders" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                    role="menuitem"
                  >
                    My Orders
                  </Link>
                  <Link 
                    href="/account/wishlist" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                    role="menuitem"
                  >
                    My Wishlist
                  </Link>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleSignOut}
                    role="menuitem"
                  >
                    Sign Out
                  </button>
                  {signOutError && (
                    <p className="px-4 py-2 text-xs text-red-500">{signOutError}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="text-gray-600 hover:text-primary" aria-label="Sign in to your account">
              <span className="sr-only">Account</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </Link>
          )}
          
          <Link href="/account/wishlist" className="text-gray-600 hover:text-primary" aria-label="View your wishlist">
            <span className="sr-only">Wishlist</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </Link>
          
          <button 
            onClick={handleOpenCart}
            className="text-gray-600 hover:text-primary relative"
            aria-label={`Open shopping cart with ${totalItems} items`}
          >
            <span className="sr-only">Cart</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center" aria-hidden="true">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-4">
          <Link href="/account/wishlist" className="text-gray-600 hover:text-primary" aria-label="View your wishlist">
            <span className="sr-only">Wishlist</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </Link>
          
          <button 
            onClick={handleOpenCart}
            className="text-gray-600 hover:text-primary relative"
            aria-label={`Open shopping cart with ${totalItems} items`}
          >
            <span className="sr-only">Cart</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center" aria-hidden="true">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>
          
          <button
            type="button"
            className="text-gray-600 hover:text-primary"
            onClick={toggleMobileMenu}
            aria-controls="mobile-menu"
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
          >
            <span className="sr-only">Open main menu</span>
            {!isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu - only shown when isMenuOpen is true */}
      {isMenuOpen && (
        <div 
          className="md:hidden bg-white border-t border-gray-200" 
          id="mobile-menu"
          ref={mobileMenuRef}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="mobile-menu-button"
        >
          <div className="container-padded py-4 space-y-4">
            <Link 
              href="/products" 
              className="text-gray-600 hover:text-primary block py-2"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
            >
              Shop
            </Link>
            <Link 
              href="/products?category=new" 
              className="text-gray-600 hover:text-primary block py-2"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
            >
              New Arrivals
            </Link>
            <Link 
              href="/collections" 
              className="text-gray-600 hover:text-primary block py-2"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
            >
              Collections
            </Link>
            <Link 
              href="/about" 
              className="text-gray-600 hover:text-primary block py-2"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
            >
              About
            </Link>
            
            {user ? (
              <>
                <div className="w-full border-t border-gray-200 my-2"></div>
                <div className="flex items-center py-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-sm font-medium text-gray-700 truncate">
                    {user.email}
                  </div>
                </div>
                <Link 
                  href="/account" 
                  className="text-gray-600 hover:text-primary py-2 block"
                  onClick={() => setIsMenuOpen(false)}
                  role="menuitem"
                >
                  My Account
                </Link>
                <Link 
                  href="/account/orders" 
                  className="text-gray-600 hover:text-primary py-2 block"
                  onClick={() => setIsMenuOpen(false)}
                  role="menuitem"
                >
                  My Orders
                </Link>
                <Link 
                  href="/account/wishlist" 
                  className="text-gray-600 hover:text-primary py-2 block"
                  onClick={() => setIsMenuOpen(false)}
                  role="menuitem"
                >
                  My Wishlist
                </Link>
                <button
                  className="text-left text-gray-600 hover:text-primary py-2 block w-full"
                  onClick={handleSignOut}
                  role="menuitem"
                >
                  Sign Out
                </button>
                {signOutError && (
                  <p className="text-xs text-red-500 py-1">{signOutError}</p>
                )}
              </>
            ) : (
              <>
                <div className="w-full border-t border-gray-200 my-2"></div>
                <Link 
                  href="/login" 
                  className="text-gray-600 hover:text-primary py-2 block"
                  onClick={() => setIsMenuOpen(false)}
                  role="menuitem"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="text-gray-600 hover:text-primary py-2 block"
                  onClick={() => setIsMenuOpen(false)}
                  role="menuitem"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;