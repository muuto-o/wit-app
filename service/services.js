// Sends response messages via the Send API
export function callSendAPI(sender_psid, response) {
  console.log("first line callSendApi");
  // Construct the message body
  let request_body = {
    messaging_type: "RESPONSE",
    recipient: {
      id: sender_psid,
    },
    message: response,
  };

  console.log("request-body:");
  console.log(request_body);
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
        console.log(
          "----------------------------------------------------ERROR-------------------------------------------------"
        );
        console.error("Unable to send message: " + err);
      }
    }
  );
}
