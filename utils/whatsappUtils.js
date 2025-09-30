// utils/whatsappUtils.js
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID; // your Twilio Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN;   // your Twilio Auth Token
const fromNumber = 'whatsapp:+14155238886';        // Twilio sandbox number

const client = twilio(accountSid, authToken);

/**
 * Send WhatsApp message
 * @param {string} to - Recipient number with country code e.g. '+919876543210'
 * @param {string} message - Message text
 * @returns {Promise} - Twilio message response
 */
async function sendWhatsApp(to, message) {
  try {
    const msg = await client.messages.create({
      from: fromNumber,
      to: `whatsapp:${to}`,
      body: message
    });
    console.log(`WhatsApp message sent to ${to}: ${msg.sid}`);
    return msg;
  } catch (err) {
    console.error('Error sending WhatsApp message:', err);
    throw err;
  }
}

module.exports = { sendWhatsApp };
