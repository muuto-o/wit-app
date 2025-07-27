// Sends response messages via the Send API
export function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    messaging_type: "RESPONSE",
    recipient: {
      id: sender_psid,
    },
    message: response,
  };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v8.0/me/messages",
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body,
    },
    (err, res, body) => {
      if (!err) {
        console.log("Message sent!");
      } else {
        console.error("Unable to send message: " + err);
      }
    }
  );
}
