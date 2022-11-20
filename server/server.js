// server.js
const express = require("express");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const http = require("http");
const port = process.env.PORT || 7777;

let SOCKETS = [];

const decoder = new TextDecoder("utf-8");

let x = 500;
let y = 500;

// add an enum with Object.freeze for code safety
const MESSAGE_ENUM = Object.freeze({
  SELF_CONNECTED: "SELF_CONNECTED",
  CLIENT_CONNECTED: "CLIENT_CONNECTED",
  CLIENT_DISCONNECTED: "CLIENT_DISCONNECTED",
  CLIENT_MESSAGE: "CLIENT_MESSAGE",
});

const app = express();

//initialize a simple http server
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  //connection is up, let's add a simple simple event
  ws.on("message", (message) => {
    x = Math.random() * 600;
    y = Math.random() * 800;
    //log the received message and send it back to the client
    console.log("received: %s", message);
    wss.broadcast(JSON.stringify({ x, y }));
  });

  //send immediatly a feedback to the incoming connection
  ws.send(JSON.stringify({ x, y }));
});

//start our server
server.listen(port, () => {
  console.log(`Server started on port ${server.address().port} :)`);
});

wss.broadcast = function broadcast(message) {
  wss.clients.forEach(c => {
    c.send(message);
  });
}