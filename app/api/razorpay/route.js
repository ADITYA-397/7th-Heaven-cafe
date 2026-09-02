import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { amount, currency = 'INR', receipt } = await req.json();

    const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.warn('Razorpay API keys missing in .env.local');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Razorpay keys not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local' 
        },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: Math.round(Number(amount) * 100), // amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ 
      success: true, 
      order, 
      keyId: key_id 
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Something went wrong while creating Razorpay order' },
      { status: 500 }
    );
  }
}

