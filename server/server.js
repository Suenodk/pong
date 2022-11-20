// server.js
const uWS = require("uWebSockets.js");
const { v4: uuidv4  } = require("uuid");
const port = process.env.PORT || 3000;

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
  .ws("/", {
    // config
    compression: 0,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 60,

    open: (ws, req) => {
      ws.username = ws.id = uuidv4();

      // subscribe to topics
      ws.subscribe(MESSAGE_ENUM.CLIENT_CONNECTED);
      ws.subscribe(MESSAGE_ENUM.CLIENT_DISCONNECTED);
      ws.subscribe(MESSAGE_ENUM.CLIENT_MESSAGE);

      // global SOCKETS array created earlier
      SOCKETS.push(ws);

      // indicate message type so the client can filter with a switch statement later on
      let selfMsg = {
        type: MESSAGE_ENUM.SELF_CONNECTED,
        body: {
          x,
          y
        },
      };

      let pubMsg = {
        type: MESSAGE_ENUM.CLIENT_CONNECTED,
        body: {
          id: ws.id,
          name: ws.username,
        },
      };

      // send to connecting socket only
      ws.send(JSON.stringify(selfMsg));

      // send to *all* subscribed sockets
      app.publish(MESSAGE_ENUM.CLIENT_CONNECTED, JSON.stringify(pubMsg));
    },

    message: (ws, message, isBinary) => {
      // decode message from client
      let clientMsg = JSON.parse(decoder.decode(message));
      let serverMsg = {};

      switch (clientMsg.type) {
        case MESSAGE_ENUM.CLIENT_MESSAGE:
          x = Math.random() * 600;
          y = Math.random() * 800;
          serverMsg = {
            type: MESSAGE_ENUM.CLIENT_MESSAGE,
            sender: ws.username,
            body: {x, y},
          };

          app.publish(MESSAGE_ENUM.CLIENT_MESSAGE, JSON.stringify(serverMsg));
          break;
        default:
          console.log("Unknown message type.");
      }
    },

    close: (ws, code, message) => {
      SOCKETS.find((socket, index) => {
        if (socket && socket.id === ws.id) {
          SOCKETS.splice(index, 1);
        }
      });

      let pubMsg = {
        type: MESSAGE_ENUM.CLIENT_DISCONNECTED,
        body: {
          id: ws.id,
          name: ws.name,
        },
      };

      app.publish(MESSAGE_ENUM.CLIENT_DISCONNECTED, JSON.stringify(pubMsg));
    },
  })
  .listen(port, (token) => {
    token
      ? console.log(`Listening to the specified port ${port}`, token)
      : console.log(`Failed to listen to the specified port ${port}`, token);
  });