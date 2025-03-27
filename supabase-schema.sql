-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  sizes VARCHAR(10)[] DEFAULT '{}',
  colors VARCHAR(50)[] DEFAULT '{}',
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(100),
  tags VARCHAR(50)[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers Table (extends Supabase Auth)
CREATE TABLE customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  address JSONB,
  phone_number VARCHAR(20),
  order_history INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  status VARCHAR(20) DEFAULT 'Pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'Pending',
  order_items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, customer_id)
);

-- Wishlists Table
CREATE TABLE wishlists (
  id SERIAL PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  product_ids INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id)
);

-- Row Level Security Policies

-- Products: Everyone can read, only authenticated admins can modify
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone" 
  ON products FOR SELECT 
  USING (true);

CREATE POLICY "Products are editable by admins" 
  ON products FOR ALL 
  USING (
    auth.uid() IN (
      SELECT id FROM customers WHERE auth.email() = any (string_to_array('admin@rashakin.com', ',')::text[])
    )
  );

-- Customers: Users can only see and edit their own data
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own data" 
  ON customers FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Customers can update their own data" 
  ON customers FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all customer data" 
  ON customers FOR SELECT 
  USING (
    auth.email() = any (string_to_array('admin@rashakin.com', ',')::text[])
  );

-- Orders: Users can only see and manage their own orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" 
  ON orders FOR SELECT 
  USING (auth.uid() = customer_id);

CREATE POLICY "Admins can view all orders" 
  ON orders FOR SELECT 
  USING (
    auth.email() = any (string_to_array('admin@rashakin.com', ',')::text[])
  );

CREATE POLICY "Admins can update all orders" 
  ON orders FOR UPDATE
  USING (
    auth.email() = any (string_to_array('admin@rashakin.com', ',')::text[])
  );

-- Reviews: Users can see all reviews but only edit their own
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone" 
  ON reviews FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own reviews" 
  ON reviews FOR INSERT 
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own reviews" 
  ON reviews FOR UPDATE
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can delete their own reviews" 
  ON reviews FOR DELETE
  USING (auth.uid() = customer_id);

-- Wishlists: Users can only see and manage their own wishlists
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist" 
  ON wishlists FOR SELECT 
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can update their own wishlist" 
  ON wishlists FOR UPDATE
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can delete their own wishlist" 
  ON wishlists FOR DELETE
  USING (auth.uid() = customer_id);

-- Trigger to update timestamp on product update
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 