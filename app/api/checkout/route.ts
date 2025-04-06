import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CartItem } from '@/app/lib/types';

// Initialize Stripe with the secret key and proper typing
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
});

/**
 * Creates a Stripe checkout session for the provided cart items
 * 
 * @param request Request containing cart items and customer details
 * @returns Response with Stripe session ID and checkout URL
 */
export async function POST(request: NextRequest) {
  try {
    const { items, customerDetails } = await request.json();
    
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }
    
    // Get base URL from env or request
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    
    // Create a list of line items for Stripe
    const lineItems = items.map((item: CartItem) => {
      // Convert relative image path to absolute URL
      const imageUrl = item.image 
        ? item.image.startsWith('http') 
          ? item.image 
          : `${baseUrl}${item.image.startsWith('/') ? '' : '/'}${item.image}` 
        : null;

      // Format variant information
      const variantInfo = [];
      if (item.size) variantInfo.push(`Size: ${item.size}`);
      if (item.color) variantInfo.push(`Color: ${item.color}`);
      const variantDescription = variantInfo.length > 0 
        ? variantInfo.join(', ')
        : 'Standard';

      return {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: item.name,
            description: variantDescription,
            images: imageUrl ? [imageUrl] : [],
          },
          unit_amount: Math.round(item.price * 100), // Stripe requires amount in pennies
        },
        quantity: item.quantity,
      };
    });
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      shipping_address_collection: {
        allowed_countries: ['GB'], // UK only for now
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 500, // £5.00
              currency: 'gbp',
            },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 3,
              },
              maximum: {
                unit: 'business_day',
                value: 5,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1000, // £10.00
              currency: 'gbp',
            },
            display_name: 'Express Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 1,
              },
              maximum: {
                unit: 'business_day',
                value: 2,
              },
            },
          },
        },
      ],
      // Store customer details to use later
      metadata: {
        customerName: customerDetails?.name || '',
        customerEmail: customerDetails?.email || '',
        customerPhone: customerDetails?.phone || '',
      },
    });
    
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Check if it's a Stripe error with a specific message
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: error.statusCode || 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}