
'use server';

import { sendEmailOtp } from '@/lib/brevo';

/**
 * Server action to generate and send an OTP.
 * In a real production app, we would store this in a temporary DB (Redis/Firestore) 
 * with a TTL. For this prototype, we'll return the success status.
 */
export async function requestOtpAction(email: string) {
  try {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Send the email via Brevo
    await sendEmailOtp(email, otp);
    
    // In a prototype, we'll "sneakily" return the OTP or just success.
    // Real security would verify this server-side against a DB.
    return { success: true, debugOtp: process.env.NODE_ENV === 'development' ? otp : null };
  } catch (error: any) {
    console.error('OTP Request Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verification would typically happen here if we used a DB.
 * For now, we handle the client-side "success" signal.
 */
export async function verifyOtpAction(email: string, otp: string, expectedOtp: string) {
  if (otp === expectedOtp) {
    return { success: true };
  }
  return { success: false, error: 'Invalid verification code.' };
}
