const uWS = require("uWebSockets.js");
const { v4: uuidv4 } = require("uuid");
const {
  SCREEN_WIDTH,
  PORT,
  EVENT_TYPE_ENUM,
  ROOM_ENUM,
  GAME_UPDATE,
  GAME_COMMANDS,
  CATEGORY_ENUM,
} = require("./constants");
const { User } = require("./user");
const { ServerMessage, ClientMessage, ErrorMessage, SuccesServerMessage } = require("./message");
const { GameServer } = require("./gameServer");

const gameServer = new GameServer();

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
      const currentUser = new User(ws, uuidv4());
      currentUser.subscribeToMessages();
      gameServer.addUser(currentUser);

      const selfMessage = new ServerMessage(
        EVENT_TYPE_ENUM.SELF_CONNECTED,
        CATEGORY_ENUM.SERVER,
        `Welcome ${currentUser.username}`,
        currentUser.id,
        {
          userId: currentUser.id,
          username: currentUser.username,
          rooms: gameServer.gameRooms.filter((r) => r !== gameServer.lobbyRoom),
          users: gameServer.users,
        }
      );
      console.log(`${currentUser.id} has logged in`);

      ws.send(JSON.stringify(selfMessage));
    },
    message: (ws, message, isBinary) => {
      const clientMessage = new ClientMessage(JSON.parse(decoder.decode(message)));

      switch (clientMessage.category) {
        case CATEGORY_ENUM.ROOM: {
          if (clientMessage.message === ROOM_ENUM.CREATE_ROOM) {
            const room = gameServer.createRoom(clientMessage.senderId);

            const message = new SuccesServerMessage(
              EVENT_TYPE_ENUM.CLIENT_MESSAGE,
              CATEGORY_ENUM.ROOM,
              ROOM_ENUM.CREATE_ROOM,
              clientMessage.senderId,
              room
            );
            
            // we send it to everyone in the lobby so they can render the room
            gameServer.sendMessageToLobbyRoom(message);
            // and also to the creator because he is not in the lobby anymore
            ws.send(JSON.stringify(message));
          } else if (clientMessage.message === ROOM_ENUM.JOIN_ROOM) {
            gameServer.joinRoom(clientMessage.senderId, clientMessage.data);
          } else {
            const errorMessage = new ErrorMessage(`${clientMessage.message} is not a valid message`);
            console.log(errorMessage.message);
            ws.send(JSON.stringify(errorMessage));
          }
          break;
        }
      }

      return;
      if (clientMsg.body.ROOM_ENUM !== undefined) {
        if (clientMsg.body.ROOM_ENUM === ROOM_ENUM.CREATE_ROOM) {
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

          if (newRoom === undefined) {
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
            type: EVENT_TYPE_ENUM.CLIENT_MESSAGE,
            actionType: ROOM_ENUM.JOIN_ROOM,
            sender: ws.username,
            room: roomId,
          };

          app.publish(EVENT_TYPE_ENUM.CLIENT_MESSAGE, JSON.stringify(serverMsg));
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
        console.log(clientMsg, "Client sending the message is not in the room specified in the message");
      }

      if (!GAME_COMMANDS.find((c) => c === clientMsg.body.GAME_UPDATE)) {
        console.log(clientMsg, "game command not recognized");
      }

      switch (clientMsg.type) {
        case EVENT_TYPE_ENUM.CLIENT_MESSAGE:
          if (clientMsg.body.GAME_UPDATE === GAME_UPDATE.MOVE_LEFT) {
            if (currentRoom.topClientId === clientMsg.clientId) {
              currentRoom.gameState.topPaddle.moveLeft();
            } else if (currentRoom.bottomClientId === clientMsg.clientId) {
              currentRoom.gameState.bottomPaddle.moveLeft();
            } else {
              console.log(clientMsg, "client was still not found for the left movement");
            }
          } else if (clientMsg.body.GAME_UPDATE === GAME_UPDATE.MOVE_RIGHT) {
            if (currentRoom.topClientId === clientMsg.clientId) {
              currentRoom.gameState.topPaddle.moveRight();
            } else if (currentRoom.bottomClientId === clientMsg.clientId) {
              currentRoom.gameState.bottomPaddle.moveRight();
            } else {
              console.log(clientMsg, "client was still not found for the right movement");
            }
          } else if (clientMsg.body.GAME_UPDATE === GAME_UPDATE.STOP_MOVE_RIGHT) {
            if (currentRoom.topClientId === clientMsg.clientId) {
              currentRoom.gameState.topPaddle.stopMoveRight();
            } else if (currentRoom.bottomClientId === clientMsg.clientId) {
              currentRoom.gameState.bottomPaddle.stopMoveRight();
            } else {
              console.log(clientMsg, "client was still not found for the top right movement");
            }
          } else if (clientMsg.body.GAME_UPDATE === GAME_UPDATE.STOP_MOVE_LEFT) {
            if (currentRoom.topClientId === clientMsg.clientId) {
              currentRoom.gameState.topPaddle.stopMoveLeft();
            } else if (currentRoom.bottomClientId === clientMsg.clientId) {
              currentRoom.gameState.bottomPaddle.stopMoveLeft();
            } else {
              console.log(clientMsg, "client was still not found for the top left movement");
            }
          }

          serverMsg = {
            type: EVENT_TYPE_ENUM.CLIENT_MESSAGE,
            sender: ws.username,
            room: clientMsg.room,
            body: { gameState: currentRoom.gameState },
          };

          app.publish(EVENT_TYPE_ENUM.CLIENT_MESSAGE, JSON.stringify(serverMsg));
          break;
        default:
          console.log("Unknown message type.");
      }
    },

    close: (ws, code, message) => {
      gameServer.logoutUser(ws.id);

      console.log(`${ws.id} has logged out`);
    },
  })
  .listen(PORT, (token) => {
    token
      ? console.log(`Listening to the specified port ${PORT}`, token)
      : console.log(`Failed to listen to the specified port ${PORT}`, token);
  });

// 322
