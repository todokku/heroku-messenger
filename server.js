const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
//const axios = require("axios");
const bodyParser = require('body-parser');
const request = require('request');
const port = process.env.PORT || 4001;

const app = express().use(bodyParser.json());

const server = http.createServer(app);

const io = socketIo(server);

io.on("connection", socket => {
  console.log("New client connected");
  socket.on('fromMessenger', function(msg){
    io.emit('toFrontEnd', msg);
  });
  socket.on('toMessenger', function(inputMsg){
    let response;
    response = {
      "text": inputMsg
    }
    callSendAPI("3064114630319157",response)
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {
  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "123456"
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

app.post('/webhook', (req, res) => {  
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
    io.emit("fromMessenger",received_message.text)
    // Create the payload for a basic text message
    response = {
      "text": ""
    }
  }  
  
  // Sends the response message
  callSendAPI(sender_psid, response);    
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  let payload = received_postback.payload ;
  let response = {
    "text": "ohoo"
  }
  // let response = [
  //   {"text":"Hello {{user_first_name}}!"},
  //   {"text":"What is your query"},
  //   {"text":"heyy"}
  // ]


 // var msg = payload
  console.log("payload" , payload)
  callSendAPI("3064114630319157",response)
 // if(payload.type)
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = [
    {
    "recipient": {
      "id": sender_psid
    },
    "message": "Hii"
  },
  {
    "recipient": {
      "id": sender_psid
    },
    "message": "Heelo"
  },
  {
    "recipient": {
      "id": sender_psid
    },
    "message": "what"
  }
]

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages?",
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

server.listen(port, () => console.log(`Listening on port ${port}`));
