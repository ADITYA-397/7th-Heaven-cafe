import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { orderEmail, customerName, orderId, total, items, address } = await request.json();

    // Use environment variables if provided (for Production Gmail)
    // Otherwise, generate a secure Ethereal Test Account on the fly!
    let transporter;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else {
        console.log("No EMAIL_USER in .env.local, generating Ethereal Test Account...");
        let testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: testAccount.user, 
            pass: testAccount.pass,
          },
        });
    }

    const itemsHtml = items.map(i => `<li>${i.name} x${i.qty} - $${(i.price || 5) * i.qty}</li>`).join('');

    const info = await transporter.sendMail({
      from: '"7th Heaven Cafe" <orders@7thheaven.com>',
      to: orderEmail, // Sending to the registered User
      subject: `Order Confirmation: ${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fafafa; padding: 20px; border-radius: 10px;">
            <h1 style="color: #8C6A53; text-align: center;">7th Heaven Cafe</h1>
            <h2 style="color: #333;">Thank you for your order, ${customerName}!</h2>
            <p>Your order <strong>#${orderId}</strong> has been successfully placed and is being prepared.</p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin: 20px 0;">
                <h3 style="margin-top: 0;">Delivery To:</h3>
                <p style="color: #555;">${address}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #ddd;">
                <thead>
                    <tr style="background: #f4f4f4;">
                        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Items</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td style="padding: 10px;"><ul>${itemsHtml}</ul></td></tr>
                </tbody>
            </table>
            
            <h3 style="text-align: right; color: #d9534f;">Total Paid: $${total}</h3>
            
            <p style="text-align: center; color: #888; margin-top: 30px;">Thank you for choosing 7th Heaven! See you soon.</p>
        </div>
      `,
    });

    let previewUrl = null;
    if (!process.env.EMAIL_USER) {
        previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("-----------------------------------------");
        console.log("MOCK EMAIL PREVIEW URL:");
        console.log(previewUrl);
        console.log("-----------------------------------------");
    }

    return new Response(JSON.stringify({ success: true, previewUrl }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Email Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
