const uWS = require("uWebSockets.js");
const { v4: uuidv4 } = require("uuid");
const { SCREEN_WIDTH, PORT, HOST, EVENT_TYPE_ENUM, ROOM_ENUM, GAME_COMMANDS, CATEGORY_ENUM, GAME_ENUM, ACCOUNT_ENUM, CHAT_ENUM } = require("./constants");
const { User } = require("./user");
const { ServerMessage, ClientMessage, ErrorMessage, SuccesServerMessage } = require("./message");
const { GameServer } = require("./gameServer");
const { ChatMessage } = require("./chatMessage");

const gameServer = new GameServer();

const decoder = new TextDecoder("utf-8");

console.log("Listening on port", PORT);

const app = uWS
  .App()
  .ws("/", {
    // config
    compression: 0,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 60,
    upgrade: (res, req, context) => {
      if (req.getHeader("origin") !== "https://ppong.nl") {
        res.close();
        return;
      }

      res.upgrade(
        { url: req.getUrl() },
        req.getHeader("sec-websocket-key"),
        req.getHeader("sec-websocket-protocol"),
        req.getHeader("sec-websocket-extensions"),
        context
      );
    },
    open: (ws) => {
      const currentUser = new User(ws, uuidv4());
      currentUser.subscribeToMessages();
      gameServer.addUser(currentUser);

      const selfMessage = new ServerMessage(EVENT_TYPE_ENUM.SELF_CONNECTED, CATEGORY_ENUM.SERVER, `Welcome ${currentUser.id}`, currentUser.id, {
        clientId: currentUser.id,
        usersOnline: gameServer.users.length,
      });

      ws.send(JSON.stringify(selfMessage));
    },
    message: (ws, message, isBinary) => {
      const clientMessage = new ClientMessage(JSON.parse(decoder.decode(message)));

      switch (clientMessage.category) {
        // account messages
        case CATEGORY_ENUM.ACCOUNT: {
          if (clientMessage.message === ACCOUNT_ENUM.LOGIN) {
            const user = gameServer.users.find((u) => u.id === clientMessage.senderId);

            if (clientMessage.data !== undefined && clientMessage.data !== "") {
              user.username = clientMessage.data;
            }

            gameServer.addUserToLobby(user);

            console.log(`user ${user.username} has joined the server!`);

            const selfMessage = new ServerMessage(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.ACCOUNT, ACCOUNT_ENUM.LOGIN, user.id, {
              userId: user.id,
              username: user.username,
              rooms: gameServer.gameRooms.filter((r) => r !== gameServer.lobbyRoom),
              users: gameServer.users,
            });
            ws.send(JSON.stringify(selfMessage));
          }
          break;
        }
        // room messages
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
            const user = gameServer.users.find((u) => u.id === clientMessage.senderId);
            const room = gameServer.joinRoom(clientMessage.senderId, clientMessage.data);

            const message = new SuccesServerMessage(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.ROOM, ROOM_ENUM.JOIN_ROOM, clientMessage.senderId, {
              user: user,
              room: room,
            });

            // send the message to everyone in the room
            room.sendMessageToUsersInRoom(message);
          } else {
            const errorMessage = new ErrorMessage(`${clientMessage.message} is not a valid message`);
            console.log(errorMessage.message);
            ws.send(JSON.stringify(errorMessage));
          }
          break;
        }
        // chat messages
        case CATEGORY_ENUM.CHAT: {
          if (clientMessage.message === CHAT_ENUM.SEND_MESSAGE) {
            const user = gameServer.users.find((u) => u.id === clientMessage.senderId);
            const room = gameServer.gameRooms.find((r) => r.users.some(u => u === user));

            const message = new ChatMessage(clientMessage.data, user);

            const chatMessage = new SuccesServerMessage(
              EVENT_TYPE_ENUM.CLIENT_MESSAGE,
              CATEGORY_ENUM.CHAT,
              CHAT_ENUM.RECEIVE_MESSAGE,
              user.id,
              message
            );

            // for now users who are not in the room are also able to send messages to a room they are not in
            room.sendMessageToUsersInRoom(chatMessage);
          }
          break;
        }
        // game messages
        case CATEGORY_ENUM.GAME: {
          // this will be used when we want to let the user start the game
          // right now the game will start when a room in the server is full
          // if(clientMessage.message === GAME_ENUM.START_GAME) {
          // }

          // if we move or stop moving we want the gameserver to handle that
          if (
            clientMessage.message === GAME_ENUM.MOVE_LEFT ||
            clientMessage.message === GAME_ENUM.MOVE_RIGHT ||
            clientMessage.message === GAME_ENUM.STOP_MOVE_LEFT ||
            clientMessage.message === GAME_ENUM.STOP_MOVE_RIGHT
          ) {
            gameServer.processGameInput(clientMessage.senderId, clientMessage.message);
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
  .get("/*", (res, req) => {
    /* It does Http as well */
    res.writeStatus("200 OK").writeHeader("IsExample", "Yes").end("Hello there!");
  })
  .listen(HOST, PORT, (token) => {
    token ? console.log(`Listening to the specified port ${PORT}`, token) : console.log(`Failed to listen to the specified port ${PORT}`, token);
  });

// 322
