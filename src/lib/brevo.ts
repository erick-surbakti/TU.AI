
/**
 * Server-side utility for sending emails via Brevo API.
 */
export async function sendEmailOtp(toEmail: string, otp: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'ericksurbakti39@gmail.com';

  if (!apiKey) {
    console.error('Brevo API key missing in environment variables.');
    throw new Error('Email service configuration error.');
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: 'TUAI Smart Agriculture' },
        to: [{ email: toEmail }],
        subject: `${otp} is your TUAI Access Code`,
        htmlContent: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; background-color: #f9f9f9;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.05);">
              <div style="background-color: #205b5a; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px;">TUAI</h1>
              </div>
              <div style="padding: 40px; text-align: center;">
                <h2 style="color: #333333; font-size: 20px; margin-bottom: 20px;">Verification Code</h2>
                <p style="color: #666666; font-size: 16px; margin-bottom: 30px;">Please use the following 6-digit code to complete your login or registration.</p>
                <div style="background-color: #f0f4f4; border-radius: 12px; padding: 20px; font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #205b5a; display: inline-block;">
                  ${otp}
                </div>
                <p style="color: #999999; font-size: 12px; margin-top: 40px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
              </div>
              <div style="background-color: #f4f4f4; padding: 20px; text-align: center; color: #999999; font-size: 12px;">
                © 2024 TUAI Agriculture Intelligence. All Rights Reserved.
              </div>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API Error Detail:', JSON.stringify(errorData, null, 2));
      throw new Error(`Brevo service error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Failed to send email via Brevo:', err);
    throw err;
  }
}
