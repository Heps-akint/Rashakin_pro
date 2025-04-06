import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { createClient } from '@/app/lib/supabase/server';
import { OrderStatus, PaymentStatus, OrderItem, Address } from '@/app/lib/types';

// Initialize Stripe with the secret key and proper typing
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
});

/**
 * Response structure for checkout session verification
 */
interface CheckoutResponse {
  success?: boolean;
  error?: string;
  order?: {
    id: number;
    total: number;
    items: OrderItem[];
    shipping: Stripe.Checkout.Session.ShippingDetails | null;
  };
}

/**
 * Retrieves and processes a Stripe checkout session 
 * Creates an order record in the database if payment was successful
 */
export async function GET(request: NextRequest): Promise<NextResponse<CheckoutResponse>> {
  try {
    // Create a Supabase client
    const supabase = createClient();

    // Get the logged-in user (if any)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.warn('Auth error during checkout verification:', userError.message);
      // Continue anyway - we can create orders for non-logged in users
    }

    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session ID' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent', 'customer']
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get customer details from Stripe session
    const customerName = session.metadata?.customerName || '';
    const customerEmail = session.customer_email || session.metadata?.customerEmail || '';
    const customerPhone = session.metadata?.customerPhone || '';

    // Extract shipping details from the session
    const shippingDetails = session.shipping_details;
    const shippingAddress: Address | null = shippingDetails?.address
      ? {
          street: [
            shippingDetails.address.line1,
            shippingDetails.address.line2,
          ].filter(Boolean).join(', '),
          city: shippingDetails.address.city || '',
          state: shippingDetails.address.state || '',
          postal_code: shippingDetails.address.postal_code || '',
          country: shippingDetails.address.country || '',
        }
      : null;

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Missing shipping information' },
        { status: 400 }
      );
    }

    // Format line items from Stripe into order items
    const lineItems = session.line_items?.data || [];
    const orderItems: OrderItem[] = lineItems.map(item => {
      // Extract product details from description (we stored size & color there)
      const description = item.description || '';
      const sizeMatch = description.match(/Size: ([^,]+),?/);
      const colorMatch = description.match(/Color: ([^,]+)$/);
      
      return {
        product_name: item.description?.split(',')[0] || '',
        price: item.amount_total ? item.amount_total / 100 : 0, // Convert back from pennies
        quantity: item.quantity || 1,
        size: sizeMatch ? sizeMatch[1] : null,
        color: colorMatch ? colorMatch[1] : null,
      };
    });

    // Create order record in Supabase
    const customerIdToInsert = user?.id || null;

    const { data: order, error } = await supabase
      .from('orders')
      .insert([{
        customer_id: customerIdToInsert,
        status: OrderStatus.Pending,
        total_amount: session.amount_total ? session.amount_total / 100 : 0,
        shipping_address: shippingAddress,
        billing_address: shippingAddress, // Use same address for billing in this case
        payment_status: PaymentStatus.Paid,
        order_items: orderItems,
        stripe_session_id: session.id,
        stripe_payment_intent_id: typeof session.payment_intent === 'string' 
          ? session.payment_intent 
          : session.payment_intent?.id || null,
        customer_email: customerEmail,
        customer_name: customerName,
        customer_phone: customerPhone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving order to database:', error);
      return NextResponse.json(
        { error: `Failed to save order: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        total: session.amount_total ? session.amount_total / 100 : 0,
        items: orderItems,
        shipping: shippingDetails,
      },
    });
  } catch (error) {
    console.error('Error verifying checkout session:', error);
    
    // Check if it's a Stripe error with a specific message
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: error.statusCode || 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to verify checkout session' },
      { status: 500 }
    );
  }
}