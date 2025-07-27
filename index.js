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

      console.log("webhook_event");
      console.log(webhook_event);
      console.log("webhook_event['message']");
      console.log(webhook_event["message"]);

      let nlp = webhook_event["message"]["nlpv2"];

      console.log("nlpv2");
      console.log(nlp);

      let response = processMessage(message, nlp);

      console.log("Jumping to send");
      console.log("response");
      console.log(response);
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
  console.log("processMesasge Function");
  if (nlp["intents"]?.length === 0) {
    // Check if greeting
    let traits = nlp["traits"];

    console.log("trains");
    console.log(traits);
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

  console.log("Intents inferred from NLP model: ");
  console.table(nlp["intents"]);

  // Get the intent with the highest confidence
  let intent = nlp["intents"][0]["name"];
  console.log("intent");
  console.log(intent);
  let confidence = nlp["intents"][0]["confidence"];

  // If confidence of intent is less than threshold, do not process
  if (confidence < 0.7) return getDefaultResponse();

  let entities = nlp["entities"];
  console.log("entities");
  console.log(entities);
  let highest_confidence = 0;

  switch (intent) {
    case "location":
      // Get entity with highest confidence
      console.log("Locations intent detected");
      let entity = null;
      for (const e in entities) {
        let confidence = entities[e][0]["confidence"];
        if (confidence > highest_confidence) {
          highest_confidence = confidence;
          entity = entities[e][0]["name"];
        }
      }

      console.log("Entity with highest confidence: " + entity);

      return handleGeneralEnquiry(entity);
    default:
      return getDefaultResponse();
  }
}

function handleGeneralEnquiry(entity) {
  if (entity == null) return getDefaultResponse();

  let responses = {
    organisation:
      "Bright is a social enterprise where we provide vocational training to adults with intellectual disabilities.\n\n" +
      "We started a range of social enterprise projects to provide alternative work engagement opportunities for our adult trainees. " +
      "Some of the projects began as therapy programmes which encourage the development of fine motor skills; others provide a realistic vocational training environment.\n\n" +
      "All net revenue earned from the sale of our products and services go towards paying a monthly allowance for our clients' work, as well as their lunch expenses while undergoing training.",
    profit:
      "All net revenue earned from the sale of our products and services go towards paying a monthly allowance for our clients' work, as well as their lunch expenses while undergoing training.",
    manufacturer:
      "We support adults with intellectual disabilities. We started a range of social enterprise projects to provide alternative work engagement for our adult trainees.",
    products:
      "We sell craft and baker goods.\nLike our Facebook page http://fb.me/brightsocialsg to stay updated!",
    safety:
      "Our cookies are made by our clients in a clean and sanitised environment. The cookies are safe to consume before the expiry date that is printed on the packaging.",
    location: "it is Location yyyyeeeeey",
  };

  return getResponseFromMessage(responses[entity]);
}

function getDefaultResponse() {
  return getResponseFromMessage(
    "We could not understand your message. Kindly rephrase your message and send us again."
  );
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
