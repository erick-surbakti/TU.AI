
/**
 * Server-side utility for sending emails via Brevo API.
 */
export async function sendEmailOtp(toEmail: string, otp: string) {
  // Using hardcoded credentials provided for the prototype to ensure reliability
  const apiKey = 'xsmtpsib-759e6b1bfbe680a806cae94a583faf256c89dcc4e0875afde1dd692cfdc5e25e-oJQ1PbX1bwhIVcBi';
  const senderEmail = 'ericksurbakti39@gmail.com';
  const senderName = 'TUAI - Your PlantBot Friends';

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: toEmail }],
        subject: `${otp} is your TUAI Access Code`,
        htmlContent: `
          <div style="font-family: sans-serif; padding: 40px; background-color: #f4f7f6;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <div style="background-color: #205b5a; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; letter-spacing: 2px;">TUAI</h1>
              </div>
              <div style="padding: 40px; text-align: center;">
                <h2 style="color: #333;">Your Access Code</h2>
                <p style="color: #666; font-size: 16px;">Hello! Use the code below to log in to your TUAI account.</p>
                <div style="background-color: #f0fdf4; border: 2px dashed #205b5a; border-radius: 12px; padding: 20px; font-size: 32px; font-weight: bold; color: #205b5a; letter-spacing: 10px; display: inline-block; margin: 20px 0;">
                  ${otp}
                </div>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
              </div>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API Error:', errorData);
      throw new Error(`Brevo service error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Failed to send email via Brevo:', err);
    throw err;
  }
}
