// index.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
// const processMessageWithWit = require("./witService");
import processMessageWithWit from "./service/witService.js";
import { callSendAPI } from "./service/services.js"; // assuming it's a named export

dotenv.config();

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 1337;

app.get("/", (req, res) => {
  res.status(200).send("You are connected to the chatbot application.");
});
app.get("/webhook", (req, res) => {
  // Your verify token. Should be a string you set.
  let VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

app.post("/webhook", async (req, res) => {
  const body = req.body;
  console.log("\n📩 [Webhook Received]");
  console.log("body");
  console.log(body);
  console.log();
  console.log();
  console.log("---------------------------------");
  console.log();
  console.log();

  if (body.object === "page") {
    for (const entry of body.entry) {
      console.log(`➡️ Processing entry ID: ${entry.id}, time: ${entry.time}`);

      for (const event of entry.messaging) {
        const senderId = event.sender.id;
        console.log(`👤 Sender ID: ${senderId}`);

        if (event.message && event.message.text) {
          const messageText = event.message.text;
          console.log(`💬 Received message: "${messageText}"`);

          try {
            const witData = await processMessageWithWit(messageText);
            console.log("🧠 Wit.ai response:");
            console.log(JSON.stringify(witData, null, 2));

            const intent = witData?.intents?.[0]?.name || "unknown";
            console.log(`🔍 Detected intent: ${intent}`);

            let reply = `I didn't get that.`;

            if (intent === "inputng") {
              reply = "Hello! How can I help you?";
            } else if (intent === "wngTime") {
              reply = "You want the weather? Let me check...";
            } else {
              reply = `Detected intent: ${intent}`;
            }

            console.log(`📤 Sending reply: "${reply}"`);
            const respone = getResponseFromMessage(reply);
            await callSendAPI(senderId, respone);
          } catch (err) {
            console.error("❌ Error calling Wit.ai:", err);
          }
        } else {
          console.log("⚠️ Skipping event — not a text message.");
        }
      }
    }

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

function getResponseFromMessage(message) {
  const response = {
    text: message,
  };

  return response;
}

// Export the app and listener
export const listener = app.listen(PORT, () => {
  console.log(`Webhook is listening on port ${PORT}`);
});

export default app;
