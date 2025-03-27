"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from './types';

// Define the cart item type
export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

// Define the cart context type
interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number, size?: string, color?: string) => void;
  updateItemQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  totalPrice: number;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

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
    const savedCart = localStorage.getItem('rashakinCart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('rashakinCart', JSON.stringify(items));
  }, [items]);
  
  // Calculate total items and price
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Add an item to the cart
  const addItem = (product: Product, quantity: number, size?: string, color?: string) => {
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
        updatedItems[existingItemIndex].quantity += quantity;
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
        }];
      }
    });
    
    // Open the cart when an item is added
    setIsCartOpen(true);
  };
  
  // Update the quantity of an item
  const updateItemQuantity = (id: number, quantity: number) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  // Remove an item from the cart
  const removeItem = (id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  // Clear all items from the cart
  const clearCart = () => {
    setItems([]);
  };
  
  // Open the cart sidebar/modal
  const openCart = () => {
    setIsCartOpen(true);
  };
  
  // Close the cart sidebar/modal
  const closeCart = () => {
    setIsCartOpen(false);
  };
  
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