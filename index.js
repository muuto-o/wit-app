// index.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { callSendAPI } from "./service/services.js"; // assuming it's a named export

dotenv.config();

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 1337;

app.get("/", (req, res) => {
  res.status(200).send("You are connected to the chatbot application.");
});

// Creates the endpoint for our webhook
app.post("/webhook", (req, res) => {
  let body = req.body;
  console.log("body");
  console.log(body);
  // Checks this is an event from a page subscription
  if (body.object === "page") {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // Gets the message. entry.messaging is an array, but
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      let sender_psid = webhook_event["sender"]["id"];
      let message = webhook_event["message"]["text"];
      console.log(
        "Message received from sender " + sender_psid + " : " + message
      );

      let nlp = webhook_event["message"]["nlp"];

      let response = processMessage(message, nlp);
      callSendAPI(sender_psid, response);
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Processes and sends text message
function processMessage(message, nlp) {
  if (nlp["intents"].length === 0) {
    // Check if greeting
    let traits = nlp["traits"];

    if (
      traits["wit$greetings"] &&
      traits["wit$greetings"][0]["value"] === "true"
    ) {
      console.log("Is greeting");
      return getResponseFromMessage(
        "Hi there! Welcome to Bright. How can I help you?"
      );
    }

    console.log("Returning default response");
    return getDefaultResponse();
  }
}

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
