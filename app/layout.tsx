import React from 'react';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthProvider } from './lib/auth-context';
import { CartProvider } from './lib/cart-context';
import CartSidebar from './components/cart/CartSidebar';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer

// Font configuration
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair-display',
});

// Metadata for SEO
export const metadata: Metadata = {
  title: 'Rashakin - Luxury Fashion Boutique',
  description: 'Discover the latest clothing collections at Rashakin - quality fashion for every occasion.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-white min-h-screen flex flex-col">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-grow">
              <ToastContainer
                position="bottom-right" // Position toasts
                autoClose={3000} // Auto close after 3 seconds
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light" // Or "dark" or "colored"
              />
              {children}
            </main>
            <Footer />
            <CartSidebar />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}