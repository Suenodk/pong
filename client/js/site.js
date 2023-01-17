// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
const vh = window.innerHeight * 0.01;
const vw = window.innerWidth * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty("--vh", `${vh}px`);
// Generate a random placeholder
const generatedUsername = `${adjectives[Math.floor(Math.random() * adjectives.length)]} chonker`;
document.getElementById("username-input").placeholder = generatedUsername;

const particles = [];

// percentage of the view width and view height
const screenWidth = 100 * vw;
const screenHeight = 100 * vh;

let touchX = undefined;
const touchBuffer = 8;

let canvasRectangle = document.getElementById("canvas-container").getBoundingClientRect();

let app = new PIXI.Application({ width: screenWidth, height: screenHeight, antialias: true, backgroundColor: 0x19171c });
document.getElementById("canvas-container").appendChild(app.view);

const usernameInput = (document.getElementById("username-input").onkeydown = (e) => {
  if (e.key.toUpperCase() === "ENTER") {
    login();
  }
});

Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// const messageContentInput = (document.getElementById("message-content").onkeydown = (e) => {
//   if (e.key.toUpperCase() === "ENTER") {
//     sendMessage();
//   }
// });

const bottomPaddle = new Paddle(screenWidth / 2, screenHeight - screenHeight / 20, screenWidth / 2.5, screenHeight / 50);
const topPaddle = new Paddle(screenWidth / 2, screenHeight / 20, screenWidth / 2.5, screenHeight / 50);
const ball = new Ball(-screenWidth / 2, -screenHeight / 2, screenHeight / 50);

app.ticker.add((delta) => {
  if (currentCountdownNumber !== undefined) {
    currentCountdownNumber.style.fontSize -= Math.max(currentCountdownNumber.style.fontSize - screenHeight / 200, 0);
    if (currentCountdownNumber.style.fontSize <= 0) {
      app.stage.removeChild(currentCountdownNumber);
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].graphics.x += particles[i].velocityX * particles[i].speed;
    particles[i].graphics.y += particles[i].velocityY * particles[i].speed;
    particles[i].graphics.scale.set(particles[i].graphics.scale.x - 0.1, particles[i].graphics.scale.y - 0.1);
    if(particles[i].graphics.scale.x < 0 || particles[i].graphics.scale.y < 0) {
      particles.splice(i, 1);
    }
  }

  // handles the touch events
  if (clientId === undefined) return;

  if (touchX !== undefined) {
    if (touchX < bottomPaddle.graphics.x - touchBuffer) {
      ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.GAME, GAME_ENUM.MOVE_LEFT, clientId)));
      ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.GAME, GAME_ENUM.STOP_MOVE_RIGHT, clientId)));
    } else if (touchX > bottomPaddle.graphics.x + touchBuffer) {
      ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.GAME, GAME_ENUM.MOVE_RIGHT, clientId)));
      ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.GAME, GAME_ENUM.STOP_MOVE_LEFT, clientId)));
    } else {
      ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.GAME, GAME_ENUM.STOP_MOVE_LEFT, clientId)));
      ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.GAME, GAME_ENUM.STOP_MOVE_RIGHT, clientId)));
    }
  }
});

onkeydown = (e) => {
  switch (e.key.toUpperCase()) {
    case "ARROWLEFT": {
      ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.GAME, GAME_ENUM.MOVE_LEFT, clientId)));
      break;
    }
    case "ARROWRIGHT": {
      ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.GAME, GAME_ENUM.MOVE_RIGHT, clientId)));
      break;
    }
  }
};

document.addEventListener("touchstart", (e) => {
  for (let i = 0; i < e.targetTouches.length; i++) {
    touchX = e.targetTouches[i].clientX - canvasRectangle.left;
  }
});

document.addEventListener("touchmove", (e) => {
  for (let i = 0; i < e.targetTouches.length; i++) {
    touchX = e.targetTouches[i].clientX - canvasRectangle.left;
  }
});

document.addEventListener("touchend", (e) => {
  touchX = undefined;
  ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.GAME, GAME_ENUM.STOP_MOVE_LEFT, clientId)));
  ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.GAME, GAME_ENUM.STOP_MOVE_RIGHT, clientId)));
});

onkeyup = (e) => {
  switch (e.key.toUpperCase()) {
    case "ARROWLEFT": {
      ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.GAME, GAME_ENUM.STOP_MOVE_LEFT, clientId)));
      break;
    }
    case "ARROWRIGHT": {
      ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.GAME, GAME_ENUM.STOP_MOVE_RIGHT, clientId)));
      break;
    }
  }
};

function joinRoom() {
  const roomId = document.getElementById("room-id-input").value;

  ws.send(
    JSON.stringify({
      type: MESSAGE_ENUM.CLIENT_MESSAGE,
      clientId: clientId,
      body: { ROOM_ENUM: ROOM_ENUM.JOIN_ROOM, roomId: roomId },
    })
  );
}

function createRoom() {
  ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.ROOM, ROOM_ENUM.CREATE_ROOM, clientId)));
}

function navigateToGameRoom() {
  document.getElementById("lobby-screen").style.display = "none";
  document.getElementById("room-screen").style.display = "flex";
  document.getElementById("room-name").value = currentRoom.name;
  document.getElementById("victory-points").value = currentRoom.victoryPoints;
}

function login() {
  let username = document.getElementById("username-input").value;

  if (username === undefined || !username.trim().length) username = generatedUsername;

  ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.ACCOUNT, ACCOUNT_ENUM.LOGIN, clientId, username)));
}

function sendMessage() {
  const message = document.getElementById("message-content").value;
  document.getElementById("message-content").value = "";
  // if the message is undefined or the message is empty we don't want to send it
  if (message != undefined && message.trim().length)
    ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.CHAT, CHAT_ENUM.SEND_MESSAGE, clientId, message)));
}

function displayChatMessages() {
  const parent = document.getElementById("chat-messages");

  while (parent.firstChild) {
    parent.removeChild(parent.lastChild);
  }

  messages.forEach((m) => {
    const messageWrapper = document.createElement("div");
    const messageSender = document.createElement("span");
    const messageContent = document.createElement("span");

    messageWrapper.classList.add("chat-message", "mx-1");
    messageSender.classList.add("mr-1");
    messageContent.classList.add("message");

    messageSender.innerHTML = m.senderUsername;
    messageContent.innerHTML = m.message;

    messageWrapper.appendChild(messageSender);
    messageWrapper.appendChild(messageContent);
    parent.appendChild(messageWrapper);
  });

  parent.scrollTop = parent.scrollHeight;
}

function startGame() {
  ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.ROOM, ROOM_ENUM.START_ROOM, clientId)));
}

function displayRooms() {
  const parent = document.getElementById("rooms");

  while (parent.firstChild) {
    parent.removeChild(parent.lastChild);
  }

  rooms.forEach((r) => {
    const roomElement = document.createElement("li");
    const roomName = document.createElement("span");
    const roomUsersWrapper = document.createElement("div");

    roomElement.classList.add("px-2", "py-1", "d-flex", "justify-space-between", "clickable");

    roomName.innerHTML = r.name;
    roomName.classList.add("body-text", "text-white");

    roomUsersWrapper.classList.add("ml-2", "d-flex", "gap-1", "align-items-center");

    for (let i = 0; i < 2; i++) {
      const roomUserCircle = document.createElement("div");
      const roomUserCircleClass = i < r.users.length ? "occupied" : "free";
      roomUserCircle.classList.add("spot", roomUserCircleClass);
      roomUsersWrapper.appendChild(roomUserCircle);
    }

    roomElement.onclick = () => {
      // sending a message that we are joining the room
      ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.ROOM, ROOM_ENUM.JOIN_ROOM, clientId, r.id)));
    };

    roomElement.appendChild(roomName);
    roomElement.appendChild(roomUsersWrapper);
    parent.appendChild(roomElement);
  });
}

function logout() {
  ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.ACCOUNT, ACCOUNT_ENUM.LOGOUT, clientId)));
}

function joinLobby() {
  ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.ROOM, ROOM_ENUM.JOIN_LOBBY, clientId)));
}

function executeActionButton() {
  // the action button should do one of the following two things:
  // logout
  // move us back to the lobby
  if(document.getElementById("lobby-screen").style.display !== "none") {
    logout();
  } else if(document.getElementById("room-screen").style.display !== "none") {
    joinLobby();
  }
}
