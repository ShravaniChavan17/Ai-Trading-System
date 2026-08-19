import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const test = async () => {
  const { data, error } = await resend.emails.send({
    from: "AI Trading System <onboarding@resend.dev>",
    to: ["delivered@resend.dev"],
    subject: "Resend Test",
    html: "<h2>Resend is working!</h2>",
  });

  console.log("DATA:", data);
  console.log("ERROR:", error);
};

test();