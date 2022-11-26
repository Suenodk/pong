let room = "";
let clientId;
let username = "";

let rooms = [];
let users = [];

let currentCountdownNumber;

let currentRoom;

ws = new WebSocket("wss://server-9i62.onrender.com");
// const ws = new WebSocket("ws://localhost:3000");
ws.addEventListener("open", onOpenConnection);
ws.addEventListener("close", onCloseConnection);
ws.addEventListener("message", onMessage);

function onOpenConnection() {
  console.log("connected to server!");
}

function onMessage(event) {
  const message = new ClientMessage(JSON.parse(event.data));
  console.log(message);

  switch (message.eventType) {
    case EVENT_TYPE_ENUM.CLIENT_MESSAGE:
      switch (message.category) {
        case CATEGORY_ENUM.ACCOUNT: {
          if (message.message === ACCOUNT_ENUM.LOGIN) {
            username = message.data.username;
            rooms = message.data.rooms;
            users = message.data.users;
            document.getElementById("landing-screen").style.display = "none";
            document.getElementById("lobby-screen").style.display = "flex";
            document.getElementById("username-display").innerHTML = username;
            document.getElementsByTagName("header")[0].style.display = "flex";
            displayRooms();
          }
          break;
        }
        case CATEGORY_ENUM.ROOM: {
          if (message.message === ROOM_ENUM.CREATE_ROOM) {
            // we know that if the user id is our id we created the room
            // otherwise the room was created by someone else, we get this message if we are in the lobby
            rooms.push(message.data);

            if (message.senderId === clientId) {
              currentRoom = message.data;
              navigateToGameRoom(message.data.id);
            } else {
              displayRooms();
            }
          } else if (message.message === ROOM_ENUM.JOIN_ROOM) {
            // we know that if we get a join room message it applies to the room we are currently in

            // this is the user that joined the room
            const userWhoJoined = message.data.user;

            // if this user isn't in our array yet we add them
            const foundUser = users.find((u) => u.id === userWhoJoined.id);
            if (foundUser === undefined) users.push(userWhoJoined);

            // if we joined the room it will be our currentRoom
            if (message.senderId === clientId) {
              currentRoom = message.data.room;
            }

            // we also want to add them to the room
            currentRoom.users.push(userWhoJoined);

            // if it was we that joined the room we want to navigate to it
            if (message.senderId === clientId) {
              navigateToGameRoom(message.data.room.id);
            }

            // if someone joined our room we want to render his or her name on the screen
            // or if we joined the room (this means that there is already somebody there) we want to render the other users name
            document.getElementById("user-opponent").innerHTML = currentRoom.users.find((u) => u.id !== clientId).username;
          } else if (message.message === ROOM_ENUM.LEAVE_ROOM) {
            // we know that if we get a leave room message it applies to the room we are currently in
            const user = users.find((u) => u.id === message.data);
            const userIndex = currentRoom.users.indexOf(user);

            if (userIndex !== -1) {
              currentRoom.users.splice(userIndex, 1);
            }
          } else if (message.message === ROOM_ENUM.DELETE_ROOM) {
            const room = rooms.find((r) => r.id === message.data);
            const roomIndex = rooms.indexOf(room);

            if (roomIndex !== -1) {
              rooms.splice(roomIndex, 1);
              displayRooms();
            }
          }
        }
        case CATEGORY_ENUM.GAME: {
          if (message.message === GAME_ENUM.START_GAME) {
            if (currentCountdownNumber !== undefined) {
              app.stage.removeChild(currentCountdownNumber);
            }
            currentCountdownNumber = new PIXI.Text(message.data, {
              fontFamily: "Arial",
              fontSize: 256,
              fill: 0xffffff,
              align: "center",
            });
            currentCountdownNumber.x = screenWidth / 2;
            currentCountdownNumber.y = screenHeight / 2;
            currentCountdownNumber.anchor.set(0.5);
            app.stage.addChild(currentCountdownNumber);
          } else if (message.message === GAME_ENUM.UPDATE_GAME) {
            // we want to render the users paddle always as the bottom paddle
            // so if we are the bottompaddle we set the bottompaddle to the bottompaddle location
            // otherwise we set the bottompaddle to the toppaddle location
            if (clientId === message.data.bottomPaddle.user.id) {
              bottomPaddle.graphics.x = message.data.bottomPaddle.x;
              topPaddle.graphics.x = message.data.topPaddle.x;
              ball.graphics.y = message.data.ball.y;
            } else {
              topPaddle.graphics.x = message.data.bottomPaddle.x;
              bottomPaddle.graphics.x = message.data.topPaddle.x;
              ball.graphics.y = -message.data.ball.y + screenHeight;
            }

            // updating the ball
            ball.graphics.x = message.data.ball.x;
          }
        }
      }
      break;
    case EVENT_TYPE_ENUM.CLIENT_CONNECTED:
      console.log(`${msg.body.name} has joined the chat.`);
      break;
    case EVENT_TYPE_ENUM.CLIENT_DISCONNECTED:
      console.log(`${msg.body.name} has left the chat.`);
      break;
    case EVENT_TYPE_ENUM.SELF_CONNECTED:
      // the login was successful and we can go to the lobby screen
      clientId = message.data.clientId;
      document.getElementById("users-online").innerHTML = `${message.data.usersOnline} users online`;
      break;
    default:
      square.x = msg.x;
      square.y = msg.y;
      console.log("Unknown message type.", msg);
  }
}

function onCloseConnection(event) {}
