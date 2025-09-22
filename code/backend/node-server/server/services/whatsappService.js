import twilio from "twilio";
import dotenv from 'dotenv';
dotenv.config()
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

console.log(accountSid);
console.log(authToken);
const client = twilio(accountSid, authToken);

if (!accountSid || !authToken) {
  console.error("Error: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set in environment variables.");
  throw new Error("Twilio credentials are missing.");
}

export async function sendCustomMessage(toNumber, messageText) {
  try {
    const message = await client.messages.create({
      body: messageText,
      from: "whatsapp:+14155238886",
      to: `whatsapp:${toNumber}`
    });

    console.log(`Message sent successfully: ${message.sid}`);
    return message;
  } catch (error) {
    console.error("Error sending message:", error.message);
    throw error;
  }
}