// services.js
import axios from "axios";

/**
 * Sends response messages via the Facebook Send API
 * @param {string} sender_psid - The Page-Scoped ID of the user
 * @param {object} response - The message object to send
 */
export async function callSendAPI(sender_psid, response) {
  const request_body = {
    messaging_type: "RESPONSE",
    recipient: {
      id: sender_psid,
    },
    message: response,
  };
  console.log("-------------");
  console.log("-------------");
  console.log("request-body:");
  console.log(request_body);
  console.log("-------------");
  console.log("-------------");
  try {
    const result = await axios.post(
      `https://graph.facebook.com/v18.0/me/messages`,
      request_body,
      {
        params: {
          access_token: process.env.PAGE_ACCESS_TOKEN,
        },
      }
    );

    console.log("✅ Message sent:", result.data);
  } catch (error) {
    console.error("❌ Failed to send message:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error(error.message);
    }
  }
}
