// services.js
import axios from "axios";

/**
 * Sends response messages via the Facebook Send API
 * @param {string} sender_psid - The Page-Scoped ID of the user
 * @param {object} response - The message object to send
 */
export async function callSendAPI(sender_psid, response) {
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
  //   console.log("PAGE_ACCESS_TOKEN");
  //   console.log(PAGE_ACCESS_TOKEN);
  //   console.log();
  //   console.log();
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
          access_token: PAGE_ACCESS_TOKEN,
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

/**
 * Converts a user message into a chatbot response.
 * @param {string} message - The input message from the user
 * @returns {object} A response object formatted for Facebook Messenger
 */
export function processMessage(message) {
  const normalizedMessage = message.toLowerCase().trim();

  const responses = new Map([
    ["hi", "Hi there! Welcome to Bright. How can I help you?"],
    [
      "bright",
      "Bright is a social enterprise where we provide vocational training to adults with intellectual disabilities.\n\n" +
        "We started a range of social enterprise projects to provide alternative work engagement opportunities for our adult trainees. " +
        "Some of the projects began as therapy programmes which encourage the development of fine motor skills; others provide a realistic vocational training environment.\n\n" +
        "All net revenue earned from the sale of our products and services go towards paying a monthly allowance for our clients' work, as well as their lunch expenses while undergoing training.",
    ],
    [
      "proceeds",
      "All net revenue earned from the sale of our products and services go towards paying a monthly allowance for our clients' work, as well as their lunch expenses while undergoing training.",
    ],
    [
      "support",
      "We support adults with intellectual disabilities. We started a range of social enterprise projects to provide alternative work engagement for our adult trainees.",
    ],
    [
      "sell",
      "We sell craft and baker goods.\nLike our Facebook page http://fb.me/brightsocialsg to stay updated!",
    ],
    [
      "safe",
      "Our cookies are made by our clients in a clean and sanitised environment. The cookies are safe to consume before the expiry date that is printed on the packaging.",
    ],
  ]);

  for (const [keyword, response] of responses) {
    if (normalizedMessage.includes(keyword)) {
      return getResponseFromMessage(response);
    }
  }

  return getResponseFromMessage(
    "We could not understand your message. Kindly rephrase your message and send us again."
  );
}
