// server.js
const uWS = require("uWebSockets.js");
const { v4: uuidv4 } = require("uuid");
const { FRAME_RATE, SCREEN_WIDTH, SCREEN_HEIGHT, PORT } = require('./constants');

// add an enum with Object.freeze for code safety
const MESSAGE_ENUM = Object.freeze({
  SELF_CONNECTED: "SELF_CONNECTED",
  CLIENT_CONNECTED: "CLIENT_CONNECTED",
  CLIENT_DISCONNECTED: "CLIENT_DISCONNECTED",
  CLIENT_MESSAGE: "CLIENT_MESSAGE",
});

const ROOM_ENUM = Object.freeze({
  JOIN_ROOM: "JOIN_ROOM",
  CREATE_ROOM: "CREATE_ROOM",
});

const GAME_UPDATE = Object.freeze({
  MOVE_LEFT: "MOVE_LEFT",
  MOVE_RIGHT: "MOVE_RIGHT",
  STOP_MOVE_LEFT: "STOP_MOVE_LEFT",
  STOP_MOVE_RIGHT: "STOP_MOVE_RIGHT",
});

const GAME_COMMANDS = [
  GAME_UPDATE.MOVE_LEFT,
  GAME_UPDATE.MOVE_RIGHT,
  GAME_UPDATE.STOP_MOVE_LEFT,
  GAME_UPDATE.STOP_MOVE_RIGHT,
];

let SOCKETS = [];
let ROOMS = [];

class Paddle {
  x;
  velocityX;
  left = false;
  right = false;
  constructor(x) {
    this.x = x;
  }

  update() {
    if (this.left) {
      this.velocityX = -3;
    } else if (this.right) {
      this.velocityX = 3;
    } else {
      this.velocityX = 0;
    }

    this.x += this.velocityX;
  }

  moveLeft() {
    this.left = true;
  }

  moveRight() {
    this.right = true;
  }

  stopMoveLeft() {
    this.left = false;
  }

  stopMoveRight() {
    this.right = false;
  }
}
class GameState {
  topPaddle;
  bottomPaddle;

  constructor() {
    this.topPaddle = new Paddle(SCREEN_WIDTH / 2 - 100);
    this.bottomPaddle = new Paddle(SCREEN_WIDTH / 2 - 100);
  }

  update() {
    this.topPaddle.update();
    this.bottomPaddle.update();
  }
}

class Room {
  roomId;
  gameState;
  topClientId = undefined;
  bottomClientId = undefined;
  constructor(roomId) {
    this.roomId = roomId;
    this.gameState = new GameState();
  }

  get clients() {
    return [this.topClientId, this.bottomClientId];
  }

  addClient(clientId) {
    if (this.topClientId === undefined) {
      this.topClientId = clientId;
    } else if (this.bottomClientId === undefined) {
      this.bottomClientId = clientId;
    }
  }
}

const decoder = new TextDecoder("utf-8");

const app = uWS
  .App()
  .ws("/", {
    // config
    compression: 0,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 60,

    open: (ws, req) => {
      ws.room = generateRoomNumber();
      ws.username = ws.id = uuidv4();

      const room = new Room(ws.room);
      room.addClient(ws.id);

      // subscribe to topics
      ws.subscribe(MESSAGE_ENUM.CLIENT_CONNECTED);
      ws.subscribe(MESSAGE_ENUM.CLIENT_DISCONNECTED);
      ws.subscribe(MESSAGE_ENUM.CLIENT_MESSAGE);

      // global SOCKETS array created earlier
      SOCKETS.push(ws);
      ROOMS.push(room);

      updateRoom(room.roomId);

      // indicate message type so the client can filter with a switch statement later on
      let selfMsg = {
        type: MESSAGE_ENUM.SELF_CONNECTED,
        body: { room: ws.room, clientId: ws.username },
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

      if (clientMsg.body.ROOM_ENUM !== undefined) {
        if (clientMsg.body.ROOM_ENUM === ROOM_ENUM.CREATE_ROOM) {
          const roomId = generateRoomNumber();
          if (ws.room !== undefined) {
            const currentRoom = ROOMS.find((r) => r.roomId === ws.room);

            if (currentRoom.topClientId === ws.id) {
              currentRoom.topClientId = undefined;
            } else if (currentRoom.bottomClientId === ws.id) {
              currentRoom.bottomClientId = undefined;
            }
          }
          const room = new Room(roomId);
          room.addClient(ws.id);
          ROOMS.push(room);
          updateRoom(roomId);
          console.log("creating new room");
          serverMsg = {
            type: MESSAGE_ENUM.CLIENT_MESSAGE,
            actionType: ROOM_ENUM.JOIN_ROOM,
            sender: ws.username,
            room: roomId,
          };

          app.publish(MESSAGE_ENUM.CLIENT_MESSAGE, JSON.stringify(serverMsg));
          return;
        } else if (clientMsg.body.ROOM_ENUM === ROOM_ENUM.JOIN_ROOM) {
          const roomId = clientMsg.body.roomId;
          if (ws.room !== undefined) {
            const currentRoom = ROOMS.find((r) => r.roomId === ws.room);

            if (currentRoom.topClientId === ws.id) {
              currentRoom.topClientId = undefined;
            } else if (currentRoom.bottomClientId === ws.id) {
              currentRoom.bottomClientId = undefined;
            }
          }
          const newRoom = ROOMS.find((r) => r.roomId === roomId);

          if(newRoom === undefined) {
            console.log("Room is not defined");
            return;
          }

          if (newRoom.topClientId === undefined) {
            console.log("joining as top");
            newRoom.topClientId = ws.id;
          } else if (newRoom.bottomClientId === undefined) {
            console.log("joining as bottom");
            newRoom.bottomClientId = ws.id;
          } else {
            console.log("ROOM IS ALREADY FULL!");
            return;
          }

          ws.roomId = roomId;

          serverMsg = {
            type: MESSAGE_ENUM.CLIENT_MESSAGE,
            actionType: ROOM_ENUM.JOIN_ROOM,
            sender: ws.username,
            room: roomId,
          };

          app.publish(MESSAGE_ENUM.CLIENT_MESSAGE, JSON.stringify(serverMsg));
          return;
        }
      }

      if (clientMsg.room === "") {
        console.log(clientMsg, "Message was not send in any room");
        return;
      }

      const currentRoom = ROOMS.find((r) => r.roomId === clientMsg.room);

      if (currentRoom === undefined) {
        console.log(clientMsg, "Room was not found on the server");
        return;
      }

      if (!currentRoom.clients.find((c) => c === clientMsg.clientId)) {
        console.log(
          clientMsg,
          "Client sending the message is not in the room specified in the message"
        );
      }

      if (!GAME_COMMANDS.find((c) => c === clientMsg.body.GAME_UPDATE)) {
        console.log(clientMsg, "game command not recognized");
      }

      switch (clientMsg.type) {
        case MESSAGE_ENUM.CLIENT_MESSAGE:
          if (clientMsg.body.GAME_UPDATE === GAME_UPDATE.MOVE_LEFT) {
            if (currentRoom.topClientId === clientMsg.clientId) {
              currentRoom.gameState.topPaddle.moveLeft();
            } else if (currentRoom.bottomClientId === clientMsg.clientId) {
              currentRoom.gameState.bottomPaddle.moveLeft();
            } else {
              console.log(
                clientMsg,
                "client was still not found for the left movement"
              );
            }
          } else if (clientMsg.body.GAME_UPDATE === GAME_UPDATE.MOVE_RIGHT) {
            if (currentRoom.topClientId === clientMsg.clientId) {
              currentRoom.gameState.topPaddle.moveRight();
            } else if (currentRoom.bottomClientId === clientMsg.clientId) {
              currentRoom.gameState.bottomPaddle.moveRight();
            } else {
              console.log(
                clientMsg,
                "client was still not found for the right movement"
              );
            }
          } else if (
            clientMsg.body.GAME_UPDATE === GAME_UPDATE.STOP_MOVE_RIGHT
          ) {
            if (currentRoom.topClientId === clientMsg.clientId) {
              currentRoom.gameState.topPaddle.stopMoveRight();
            } else if (currentRoom.bottomClientId === clientMsg.clientId) {
              currentRoom.gameState.bottomPaddle.stopMoveRight();
            } else {
              console.log(
                clientMsg,
                "client was still not found for the top right movement"
              );
            }
          } else if (
            clientMsg.body.GAME_UPDATE === GAME_UPDATE.STOP_MOVE_LEFT
          ) {
            if (currentRoom.topClientId === clientMsg.clientId) {
              currentRoom.gameState.topPaddle.stopMoveLeft();
            } else if (currentRoom.bottomClientId === clientMsg.clientId) {
              currentRoom.gameState.bottomPaddle.stopMoveLeft();
            } else {
              console.log(
                clientMsg,
                "client was still not found for the top left movement"
              );
            }
          }

          serverMsg = {
            type: MESSAGE_ENUM.CLIENT_MESSAGE,
            sender: ws.username,
            room: clientMsg.room,
            body: { gameState: currentRoom.gameState },
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
  .listen(PORT, (token) => {
    token
      ? console.log(`Listening to the specified port ${PORT}`, token)
      : console.log(`Failed to listen to the specified port ${PORT}`, token);
  });

function generateRoomNumber() {
  const roomNumber = uuidv4().substring(0, 5);

  if (ROOMS.find((r) => r.roomId === roomNumber)) {
    return generateRoomNumber();
  } else {
    return roomNumber;
  }
}

function updateRoom(roomId) {
  const intervalId = setInterval(() => {
    const currentRoom = ROOMS.find((r) => r.roomId === roomId);

    if (currentRoom !== undefined) {
      currentRoom.gameState.update();
      serverMsg = {
        type: MESSAGE_ENUM.CLIENT_MESSAGE,
        sender: "SERVER",
        room: currentRoom.roomId,
        body: { gameState: currentRoom.gameState },
      };
      SOCKETS.filter((s) =>
        [...currentRoom.clients].some((rc) => rc === s.id)
      ).forEach((s) => {
        app.publish(MESSAGE_ENUM.CLIENT_MESSAGE, JSON.stringify(serverMsg));
      });
    }
  }, 1000 / FRAME_RATE);
}