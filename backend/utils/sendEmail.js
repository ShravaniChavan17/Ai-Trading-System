import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, text) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "AI Trading System <onboarding@resend.dev>",
      to: [to],
      subject,
      text,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      throw new Error(error.message);
    }

    console.log("✅ OTP EMAIL SENT:", data?.id);
    return data;

  } catch (error) {
    console.error("❌ EMAIL FAILED:", error.message);
    throw error;
  }
};

export const sendOTP = async (email, otp) => {
  return sendEmail(
    email,
    "Your OTP - AI Trading System",
    `Your OTP is ${otp}.\n\nThis OTP is valid for 5 minutes.`
  );
};