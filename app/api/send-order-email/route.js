import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { 
      orderEmail, 
      customerName, 
      customerPhone,
      orderId, 
      subtotal,
      taxes,
      deliveryFee = 40,
      total, 
      items = [], 
      address,
      paymentMethod = 'Online (Razorpay)',
      paymentId,
      orderDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
    } = await request.json();

    if (!orderEmail) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 });
    }

    let transporter;
    let isLiveGmail = false;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS.replace(/\s+/g, '') // remove spaces from 16-character app password
        }
      });
      isLiveGmail = true;
    } else {
      let testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const itemsRows = items.map(i => {
      const itemPrice = Number(i.price) || 0;
      const itemTotal = itemPrice * (Number(i.qty) || 1);
      return `
        <tr style="border-bottom: 1px solid #EFE8E1;">
          <td style="padding: 12px 8px; font-weight: 600; color: #3B2E28;">${i.name}</td>
          <td style="padding: 12px 8px; text-align: center; color: #7A695E;">x${i.qty || 1}</td>
          <td style="padding: 12px 8px; text-align: right; color: #7A695E;">₹${itemPrice.toFixed(2)}</td>
          <td style="padding: 12px 8px; text-align: right; font-weight: 600; color: #3B2E28;">₹${itemTotal.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F5F0; margin: 0; padding: 24px; color: #3B2E28; }
          .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #EAE3D9; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
          .header { background: #3B2E28; color: #FFFFFF; padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 26px; font-family: Georgia, serif; letter-spacing: 0.05em; color: #EAE3D9; }
          .header p { margin: 6px 0 0 0; font-size: 13px; color: #C28751; text-transform: uppercase; letter-spacing: 0.15em; }
          .content { padding: 28px 24px; }
          .status-badge { display: inline-block; background: #E8F5E9; color: #2E7D32; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
          .bill-details { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 14px; line-height: 1.6; }
          .table-wrapper { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
          .summary-table { width: 100%; margin-top: 16px; font-size: 14px; }
          .summary-table td { padding: 6px 8px; }
          .total-row { border-top: 2px solid #3B2E28; font-size: 17px; font-weight: 700; color: #3B2E28; }
          .footer { background: #F8F5F0; padding: 20px 24px; text-align: center; font-size: 12px; color: #8C6A53; border-top: 1px solid #EAE3D9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>7th Heaven Cafe</h1>
            <p>Artisanal Bakehouse & Coffee</p>
          </div>
          
          <div class="content">
            <div style="text-align: center; margin-bottom: 24px;">
              <span class="status-badge">✓ Payment Received</span>
              <h2 style="margin: 8px 0; color: #3B2E28; font-size: 22px;">Order Invoice & Confirmation</h2>
              <p style="margin: 0; color: #7A695E; font-size: 14px;">Thank you for your order, <strong>${customerName}</strong>!</p>
            </div>

            <table style="width: 100%; border-bottom: 1px solid #EFE8E1; padding-bottom: 16px; margin-bottom: 20px; font-size: 13px; color: #5C4A3E;">
              <tr>
                <td style="vertical-align: top; width: 50%;">
                  <strong>Invoice / Order ID:</strong> #${orderId.slice(-8).toUpperCase()}<br>
                  <strong>Date:</strong> ${orderDate}<br>
                  <strong>Payment Method:</strong> ${paymentMethod}
                  ${paymentId ? `<br><strong>Razorpay ID:</strong> <code>${paymentId}</code>` : ''}
                </td>
                <td style="vertical-align: top; width: 50%; text-align: right;">
                  <strong>Delivery Address:</strong><br>
                  ${address || 'Dine-In / Store Pickup'}<br>
                  ${customerPhone ? `<strong>Phone:</strong> ${customerPhone}` : ''}
                </td>
              </tr>
            </table>

            <h3 style="margin: 16px 0 8px 0; font-size: 15px; color: #3B2E28; text-transform: uppercase; letter-spacing: 0.05em;">Order Summary</h3>
            <table class="table-wrapper">
              <thead>
                <tr style="background: #F8F5F0; border-bottom: 1px solid #EAE3D9; color: #7A695E; font-size: 12px; text-transform: uppercase;">
                  <th style="padding: 8px; text-align: left;">Item</th>
                  <th style="padding: 8px; text-align: center;">Qty</th>
                  <th style="padding: 8px; text-align: right;">Price</th>
                  <th style="padding: 8px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <table class="summary-table">
              <tr>
                <td style="color: #7A695E;">Subtotal</td>
                <td style="text-align: right; color: #3B2E28; font-weight: 600;">₹${(Number(subtotal) || Number(total)).toFixed(2)}</td>
              </tr>
              ${taxes ? `
              <tr>
                <td style="color: #7A695E;">GST & Taxes (5%)</td>
                <td style="text-align: right; color: #3B2E28; font-weight: 600;">₹${Number(taxes).toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="color: #7A695E;">Delivery / Packaging</td>
                <td style="text-align: right; color: #3B2E28; font-weight: 600;">₹${Number(deliveryFee).toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td style="padding-top: 12px;">Total Paid</td>
                <td style="padding-top: 12px; text-align: right; color: #C28751; font-size: 20px;">₹${Number(total).toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="footer">
            <p style="margin: 0 0 6px 0;"><strong>7th Heaven Cafe</strong> · Freshly crafted with love</p>
            <p style="margin: 0;">If you have any questions, reply directly to this email or call our cafe helpline.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await transporter.sendMail({
        from: `"7th Heaven Cafe" <${process.env.EMAIL_USER || 'orders@7thheaven.com'}>`,
        to: orderEmail,
        subject: `🧾 Your 7th Heaven Cafe Order Invoice #${orderId.slice(-6).toUpperCase()}`,
        html: htmlContent,
      });

      let previewUrl = null;
      if (!isLiveGmail) {
        previewUrl = nodemailer.getTestMessageUrl(info);
      }

      return NextResponse.json({ success: true, messageId: info.messageId, previewUrl });
    } catch (sendErr) {
      console.warn("Gmail direct send failed, falling back to test mail:", sendErr.message);
      
      // Fallback to test transporter so user's checkout flow is never blocked
      let testAccount = await nodemailer.createTestAccount();
      let testTransporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const testInfo = await testTransporter.sendMail({
        from: '"7th Heaven Cafe" <orders@7thheaven.com>',
        to: orderEmail,
        subject: `🧾 Your 7th Heaven Cafe Order Invoice #${orderId.slice(-6).toUpperCase()}`,
        html: htmlContent,
      });

      const previewUrl = nodemailer.getTestMessageUrl(testInfo);
      return NextResponse.json({ 
        success: true, 
        fallback: true, 
        previewUrl, 
        warning: 'Gmail authentication failed. Set a valid Gmail App Password in .env.local to send live emails.' 
      });
    }

  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

