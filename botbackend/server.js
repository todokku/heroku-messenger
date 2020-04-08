const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const bodyParser = require('body-parser');
const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express().use(bodyParser.json());

const server = http.createServer(app);

const io = socketIo(server); // < Interesting!

let interval;

io.on("connection", socket => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 10000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});


const getApiAndEmit = async socket => {
    try {
      const res = await axios.get(
        "https://api.darksky.net/forecast/PUT_YOUR_API_KEY_HERE/43.7695,11.2558"
      ); // Getting the data from DarkSky
      socket.emit("FromAPI", res.data.currently.temperature); // Emitting a new message. It will be consumed by the client
    } catch (error) {
      console.error(`Error: ${error.code}`);
    }
  };
  server.listen(port, () => console.log(`Listening on port ${port}`));

// const
//  express = require('express'),
//  bodyParser = require('body-parser'),
//  app = express().use(bodyParser.json()); // creates express http server
 app.use(index);
 
// Sets server port and logs message on success
//app.listen(port, () => console.log(`Listening on port ${port}`));
//app.listen(process.env.PORT || 4001, () => console.log('webhook is listening'));