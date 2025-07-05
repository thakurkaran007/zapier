// resend.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, body: string) {
  try {
    const response = await resend.emails.send({
      from: 'contact@thakurkaran.xyz', // Must be verified in Resend
      to,
      subject: 'Hello from Zapier',
      text: body,
    });

    console.log("Email sent:", response);
    return response;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}