# Rashakin E-commerce Website

A custom e-commerce platform for the Rashakin clothing brand, providing a complete solution for selling clothes online without relying on third-party marketplaces.

## Features

- **Product Management**: Add, edit, and remove products with details like images, sizes, colors, and inventory
- **Order Management**: Track and update order status, handle returns and refunds
- **Customer Management**: View customer details and order history
- **User Authentication**: Secure account management for customers and admin
- **Shopping Experience**: Browse products, add to cart, checkout with Stripe payments
- **Quality-of-Life Features**: Wishlists, reviews, order tracking, and email notifications

## Tech Stack

- **Frontend**: Next.js 13+ (App Router) with TypeScript and Tailwind CSS
- **Backend**: Next.js API Routes
- **Database & Auth**: Supabase (PostgreSQL and Auth)
- **Payment Processing**: Stripe integration
- **Hosting**: Vercel (recommended)
- **Version Control**: Git and GitHub

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Supabase account (for database and authentication)
- Stripe account (for payment processing)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Heps-akint/Rashakin_pro.git
   cd Rashakin_pro
   ```

2. Install dependencies using the provided script:
   ```bash
   # On Windows
   .install-deps.bat
   
   # On macOS/Linux
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase and Stripe credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     STRIPE_SECRET_KEY=your_stripe_secret_key
     STRIPE_WEBHOOK_SECRET=your_webhook_secret
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
     ```

4. Set up the database:
   - Create a new Supabase project
   - Run the SQL commands in `supabase-schema.sql` in the Supabase SQL editor to create the necessary tables and relationships

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/app`: Next.js 13+ App Router components and pages
  - `/api`: API routes for server-side operations
  - `/components`: Reusable UI components
    - `/ui`: Basic UI components (buttons, forms, etc.)
    - `/cart`: Cart-related components
    - `/products`: Product display components
  - `/lib`: Utility functions, types, and context providers
  - `/hooks`: Custom React hooks
  - `/(auth)`: Authentication pages (login, signup, etc.)
  - `/admin`: Admin dashboard and management
  - `/products`: Product pages and details
  - `/cart`: Shopping cart page
  - `/checkout`: Checkout process
- `/public`: Static assets (images, fonts, etc.)

## Development Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "Descriptive commit message"
   ```

3. Push your branch to GitHub:
   ```bash
   git push -u origin feature/your-feature-name
   ```

4. Create a Pull Request on GitHub to merge your changes into the main branch.

## Deployment

The application can be deployed to Vercel with the following steps:

1. Push your code to the GitHub repository
2. Connect the repository to Vercel
3. Configure all environment variables in the Vercel dashboard
4. Deploy

For other hosting options, you can build the application using:
```bash
npm run build
```

And then start the production server:
```bash
npm start
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is private and proprietary.

## Contact

For questions or support, please contact the Rashakin team.