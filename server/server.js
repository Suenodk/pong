// server.js
const uWS = require("uWebSockets.js");
const { v4: uuidv4  } = require("uuid");
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

const app = uWS
  .App()
  .listen(port, (token) => {
    token
      ? console.log(`Listening to the specified port ${port}`, token)
      : console.log(`Failed to listen to the specified port ${port}`, token);
  });