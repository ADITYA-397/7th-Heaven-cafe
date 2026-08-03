import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { amount, currency = 'INR' } = await req.json();

    // Ensure we have API keys (use placeholders if missing so it doesn't crash immediately on load)
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_HERE';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET_HERE';

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
