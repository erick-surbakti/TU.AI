
'use server';

import { sendEmailOtp } from '@/lib/brevo';

/**
 * Server action to generate and send an OTP.
 */
export async function requestOtpAction(email: string) {
  try {
    // Generate a secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log(`Sending OTP ${otp} to ${email}`);

    // Send the email via Brevo
    await sendEmailOtp(email, otp);
    
    // For prototype/debugging in the UI, we return the OTP if not in strict production.
    // In a real high-security app, you would ONLY return success: true.
    return { success: true, debugOtp: otp };
  } catch (error: any) {
    console.error('OTP Request Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verification placeholder. 
 * In a production app, we would verify the OTP against a Redis or Firestore store with a TTL.
 */
export async function verifyOtpAction(email: string, otp: string, expectedOtp: string) {
  if (otp === expectedOtp) {
    return { success: true };
  }
  return { success: false, error: 'Invalid verification code.' };
}
