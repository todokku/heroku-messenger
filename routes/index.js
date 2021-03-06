const express = require("express");
const router = express.Router();
const request = require('request');
const socketIo = require("socket.io");

// Creates the endpoint for our webhook 
router.post('/webhook', (req, res) => {  
    let body = req.body;
  
    // Checks this is an event from a page subscription
    if (body.object === 'page') {
  
      // Iterates over each entry - there may be multiple if batched
      body.entry.forEach(function(entry) {

        // Gets the body of the webhook event
        let webhook_event = entry.messaging[0];
        console.log(webhook_event);
      
      
        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        console.log('Sender PSID: ' + sender_psid);
      
        // Check if the event is a message or postback and
        // pass the event to the appropriate handler function
        if (webhook_event.message) {
          handleMessage(sender_psid, webhook_event.message);        
        } else if (webhook_event.postback) {
          handlePostback(sender_psid, webhook_event.postback);
        }
        
      });
  
      // Returns a '200 OK' response to all requests
      res.status(200).send('EVENT_RECEIVED');
    } else {
      // Returns a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
  
  });

  // Handles messages events
  function handleMessage(sender_psid, received_message) {

    let response;
    
    // Check if the message contains text
    if (received_message.text) {    
      console.log("ssss")
      socketIo().emit('chat',received_message.text)
      // Create the payload for a basic text message
      response = {
        "text": `You sent the message: "${received_message.text}". Now send me an image!`
      }
    }  
    
    // Sends the response message
    callSendAPI(sender_psid, response);    
  }

  // Handles messaging_postbacks events
  function handlePostback(sender_psid, received_postback) {

  }

  // Sends response messages via the Send API
  function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response
    }
  
    // Send the HTTP request to the Messenger Platform
    request({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": { "access_token": "EAADhAkZCgj7QBAFwncIYuPjvAixZBQXvTKVXMQwWrqeJZA5vF21OYXWn3Cg438fXygJLZAWMaeHRUvDUTBmU3BgmPzniNKkJPKoZB2VFT5g0tllDvDppqUFsOvMsEsCmqsf3rnDZBxJrInuPqnZAJMzSV48tEUsEcZCZCeyZCwhgf7vtVn2C2ib1fKYE1EwPpiJr0ZD" },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log('message sent!')
      } else {
        console.error("Unable to send message:" + err);
      }
    }); 
  }
module.exports = router;