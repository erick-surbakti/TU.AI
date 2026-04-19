
/**
 * Server-side utility for sending emails via Brevo API.
 */
export async function sendEmailOtp(toEmail: string, otp: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey || !senderEmail) {
    throw new Error('Brevo configuration missing in environment variables.');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: 'TUAI Support' },
      to: [{ email: toEmail }],
      subject: 'Your TUAI Verification Code',
      htmlContent: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #205b5a;">Welcome to TUAI</h2>
          <p>Your verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #205b5a; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p style="font-size: 12px; color: #666;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Brevo Error:', errorData);
    throw new Error('Failed to send email via Brevo.');
  }

  return response.json();
}
