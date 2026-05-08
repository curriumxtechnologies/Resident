import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an OTP email
 * @param {string} to - recipient email
 * @param {string} otp - 6-digit code
 */
export const sendOTPEmail = async (to, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #333;">Your verification code</h2>
      <p>Please use the following OTP to complete your authentication on RezidentHomes:</p>
      <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${otp}</span>
      </div>
      <p style="color: #666;">This code will expire in 10 minutes.</p>
      <p style="color: #999;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "RezidentHomes <noreply@rezidenthomes.com>", // Your verified domain
      to,
      subject: "Your RezidentHomes Verification Code",
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error("Failed to send email");
    }

    return data;
  } catch (err) {
    throw err;
  }
};