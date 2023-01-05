let room = "";
let clientId;
let username = "";

let messages = [];
let rooms = [];
let users = [];
let ourScore;
let theirScore;

let currentCountdownNumber;

let currentRoom;

// ws = new WebSocket("wss://server-9i62.onrender.com");
const ws = new WebSocket("ws://localhost:3000");
ws.addEventListener("open", onOpenConnection);
ws.addEventListener("close", onCloseConnection);
ws.addEventListener("message", onMessage);

function onOpenConnection() {}

function onMessage(event) {
  const message = new ClientMessage(JSON.parse(event.data));
  // console.log(message);

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
            document.getElementById("lobby-song").play();
          } else if(message.message === ACCOUNT_ENUM.LOGOUT) {
            document.getElementById("lobby-screen").style.display = "none";
            document.getElementById("landing-screen").style.display = "flex";
            document.getElementsByTagName("header")[0].style.display = "none";
          }
          break;
        }
        case CATEGORY_ENUM.ROOM: {
          if (message.message === ROOM_ENUM.JOIN_LOBBY) {
            rooms = message.data.rooms;
            users = message.data.users;
            document.getElementById("room-screen").style.display = "none";
            document.getElementById("game-screen").style.display = "none";
            document.getElementById("lobby-screen").style.display = "flex";
            document.getElementsByTagName("header")[0].style.display = "flex";
            displayRooms();
          } else if (message.message === ROOM_ENUM.CREATE_ROOM) {
            // we know that if the user id is our id we created the room
            // otherwise the room was created by someone else, we get this message if we are in the lobby
            rooms.push(message.data);

            if (message.senderId === clientId) {
              currentRoom = message.data;
              document.getElementById("player-1").innerHTML = "You";
              document.getElementById("player-2").innerHTML = "[Empty slot]";
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

            currentRoom = message.data.room;

            // if we joined the room it will be our currentRoom
            if (message.senderId === clientId) {
              navigateToGameRoom(message.data.room.id);
              document.getElementById("player-1").innerHTML = currentRoom.users[0].username;
              document.getElementById("player-2").innerHTML = "You";
              document.getElementById("room-name").setAttribute("disabled", "");
              document.getElementById("victory-points").setAttribute("disabled", "");
              document.getElementById("start-game").setAttribute("disabled", "");
            }
            
            // if we are the first user that joined the room we want to render the other person
            if(message.data.room.users[0].id === clientId) {
              document.getElementById("player-2").innerHTML = currentRoom.users[1].username;
            }
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
          } else if(message.message === ROOM_ENUM.START_ROOM) {
            document.getElementsByTagName("header")[0].style.display = "none";
            document.getElementById("room-screen").style.display = "none";
            document.getElementById("game-screen").style.display = "flex";
          }
        }
        // chat messages
        case CATEGORY_ENUM.CHAT: {
          if (message.message === CHAT_ENUM.RECEIVE_MESSAGE) {
            // when we get this message we know that we are in the same room as the sender
            // thus we want to push it to our messages array so we can display it to the user
            messages.push(message.data);
            displayChatMessages();
          }
          break;
        }
        case CATEGORY_ENUM.GAME: {
          if (message.message === GAME_ENUM.START_GAME) {
            if (currentCountdownNumber !== undefined) {
              app.stage.removeChild(currentCountdownNumber);
            }
            currentCountdownNumber = new PIXI.Text(message.data, {
              fontFamily: "Poppins",
              fontSize: screenWidth / 4,
              fill: 0xffffff,
              align: "center",
            });
            currentCountdownNumber.x = screenWidth / 2;
            currentCountdownNumber.y = screenHeight / 2;
            currentCountdownNumber.anchor.set(0.5);
            app.stage.addChild(currentCountdownNumber);
          } else if (message.message === GAME_ENUM.UPDATE_GAME) {
            if (ourScore === undefined) {
              ourScore = new PIXI.Text(0, {
                fontFamily: "Poppins",
                fontSize: screenWidth / 6,
                fill: 0xffffff,
                align: "center",
              });
              ourScore.x = screenWidth / 2;
              ourScore.y = screenHeight / 2 + screenHeight / 4;
              ourScore.anchor.set(0.5);
              app.stage.addChild(ourScore);
            }
            if (theirScore === undefined) {
              theirScore = new PIXI.Text(0, {
                fontFamily: "Poppins",
                fontSize: screenWidth / 6,
                fill: 0xffffff,
                align: "center",
              });
              theirScore.x = screenWidth / 2;
              theirScore.y = screenHeight / 2 - screenHeight / 4;
              theirScore.anchor.set(0.5);
              app.stage.addChild(theirScore);
            }
            // we want to render the users paddle always as the bottom paddle
            // so if we are the bottompaddle we set the bottompaddle to the bottompaddle location
            // otherwise we set the bottompaddle to the toppaddle location
            if (clientId === message.data.bottomPaddle.user.id) {
              bottomPaddle.graphics.x = message.data.bottomPaddle.x * vw;
              topPaddle.graphics.x = message.data.topPaddle.x * vw;
              ball.graphics.y = message.data.ball.y * vh;
              ourScore.text = message.data.bottomPaddle.score;
              theirScore.text = message.data.topPaddle.score;
            } else {
              topPaddle.graphics.x = message.data.bottomPaddle.x * vw;
              bottomPaddle.graphics.x = message.data.topPaddle.x * vw;
              ball.graphics.y = -message.data.ball.y * vh + screenHeight;
              score = message.data.topPaddle.score;
              ourScore.text = message.data.topPaddle.score;
              theirScore.text = message.data.bottomPaddle.score;
            }

            // updating the ball
            ball.graphics.x = message.data.ball.x * vw;
          } else if (message.message === GAME_ENUM.BlAST) {
            for (let i = 0; i < 300; i++) {
              particles.push(new Particle(message.data.x * vw, message.data.y * vh, Math.random() * 5 + 3));
            }
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

      const usersOnlineH5 = document.createElement("h5");
      usersOnlineH5.innerHTML = `${message.data.usersOnline} players online`;

      document.getElementById("users-online-loader").parentElement.appendChild(usersOnlineH5);
      document.getElementById("users-online-loader").remove();
      break;
    default:
      square.x = msg.x;
      square.y = msg.y;
      console.log("Unknown message type.", msg);
  }
}

function onCloseConnection(event) {}
