# Rashakin E-commerce Website

A custom e-commerce platform for the Rashakin clothing brand, providing a complete solution for selling clothes online without relying on third-party marketplaces like eBay.

## Features

- **Product Management**: Add, edit, and remove products with details like images, sizes, colors, and inventory
- **Order Management**: Track and update order status, handle returns and refunds
- **Customer Management**: View customer details and order history
- **User Authentication**: Secure account management for customers and admin
- **Shopping Experience**: Browse products, add to cart, checkout with Stripe payments
- **Quality-of-Life Features**: Wishlists, reviews, order tracking, and email notifications

## Tech Stack

- **Frontend**: Next.js with Tailwind CSS
- **Backend**: Next.js API Routes
- **Database & Auth**: Supabase (PostgreSQL and Auth)
- **Payment**: Stripe integration
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Supabase account
- Stripe account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/rashakin.git
   cd rashakin
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase and Stripe credentials

4. Set up the database:
   - Create a new Supabase project
   - Run the SQL commands in `supabase-schema.sql` in the Supabase SQL editor

5. Start the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/app`: Next.js App Router components and pages
  - `/api`: API routes for server-side operations
  - `/components`: Reusable UI components
  - `/lib`: Utility functions and types
  - `/hooks`: Custom React hooks
- `/public`: Static assets

## Deployment

The application can be deployed to Vercel with the following steps:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Configure environment variables in the Vercel dashboard
4. Deploy

## License

This project is private and proprietary. 