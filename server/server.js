const uWS = require("uWebSockets.js");
const { v4: uuidv4 } = require("uuid");
const { PORT, HOST, ORIGIN, EVENT_TYPE_ENUM, ROOM_ENUM, CATEGORY_ENUM, GAME_ENUM, ACCOUNT_ENUM, CHAT_ENUM } = require("./constants");
const { User } = require("./user");
const { ServerMessage, ClientMessage, ErrorMessage, SuccesServerMessage } = require("./message");
const { GameServer } = require("./gameServer");
const { ChatMessage } = require("./chatMessage");

const gameServer = new GameServer();

const decoder = new TextDecoder("utf-8");

const app = uWS
  .App()
  .ws("/", {
    // config
    compression: 0,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 60,
    upgrade: (res, req, context) => {
      console.log(req.getHeader("origin"))
      if (req.getHeader("origin") !== ORIGIN) {
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
          } else if(clientMessage.message === ROOM_ENUM.START_ROOM) {
            const user = gameServer.users.find((u) => u.id === clientMessage.senderId);
            const room = gameServer.gameRooms.find((r) => r.users.some(u => u === user));

            gameServer.startRoom(room);

            const message = new SuccesServerMessage(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.ROOM, ROOM_ENUM.START_ROOM, clientMessage.senderId);

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
// 167