"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Product, CartItem } from './types';

// Define the cart context type with more specific return types
interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number, size?: string, color?: string) => void;
  updateItemQuantity: (id: number, quantity: number, size?: string, color?: string) => void;
  removeItem: (id: number, size?: string, color?: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  totalPrice: number;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Local storage key constant to avoid typos
const CART_STORAGE_KEY = 'rashakinCart';

// Cart provider props
interface CartProviderProps {
  children: React.ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  // State for cart items
  const [items, setItems] = useState<CartItem[]>([]);
  
  // State for cart UI (open/closed)
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Load cart from localStorage on initial render (client-side only)
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart) as CartItem[];
        setItems(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [items]);
  
  // Calculate total items and price with memoization
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Add an item to the cart
  const addItem = useCallback((product: Product, quantity: number, size?: string, color?: string) => {
    setItems(prevItems => {
      // Check if the item already exists in the cart (with the same size and color if applicable)
      const existingItemIndex = prevItems.findIndex(item => 
        item.id === product.id && 
        item.size === size && 
        item.color === color
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity if the item exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      } else {
        // Add new item if it doesn't exist
        return [...prevItems, {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || '',
          quantity,
          size,
          color,
          product, // Store the full product for reference
        }];
      }
    });
  }, []);
  
  // Update the quantity of an item
  const updateItemQuantity = useCallback((id: number, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      removeItem(id, size, color);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id && item.size === size && item.color === color ? { ...item, quantity } : item
      )
    );
  }, []);
  
  // Remove an item from the cart
  const removeItem = useCallback((id: number, size?: string, color?: string) => {
    setItems(prevItems => prevItems.filter(item => 
      !(item.id === id && item.size === size && item.color === color)
    ));
  }, []);
  
  // Clear all items from the cart
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);
  
  // Open the cart sidebar/modal
  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);
  
  // Close the cart sidebar/modal
  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);
  
  const value = {
    items,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    isCartOpen,
    openCart,
    closeCart,
    totalItems,
    totalPrice,
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use the cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}