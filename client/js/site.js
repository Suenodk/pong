// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
const vh = window.innerHeight * 0.01;
const vw = window.innerWidth * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty("--vh", `${vh}px`);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then((res) => console.log("service worker registered"))
      .catch((err) => console.log("service worker not registered", err));
  });
}
// percentage of the view width and view height
const screenWidth = 80 * vw;
const screenHeight = 90 * vh;

let touchX = undefined;
const touchBuffer = 8;

let canvasRectangle = document.getElementById("canvas-container").getBoundingClientRect();

let app = new PIXI.Application({ width: screenWidth, height: screenHeight });
document.getElementById("canvas-container").appendChild(app.view);

const usernameInput = (document.getElementById("username-input").onkeydown = (e) => {
  if (e.key.toUpperCase() === "ENTER") {
    login();
  }
});

const messageContentInput = (document.getElementById("message-content").onkeydown = (e) => {
  if (e.key.toUpperCase() === "ENTER") {
    sendMessage();
  }
});

const bottomPaddle = new Paddle(screenWidth / 2, screenHeight - screenHeight / 20, screenWidth / 2.5, screenHeight / 50);
const topPaddle = new Paddle(screenWidth / 2, screenHeight / 20, screenWidth / 2.5, screenHeight / 50);
const ball = new Ball(screenWidth / 2, screenHeight / 2, screenHeight / 40);

app.ticker.add((delta) => {
  if (currentCountdownNumber !== undefined) {
    currentCountdownNumber.style.fontSize -= 2.5;
    if (currentCountdownNumber.style.fontSize <= 0) {
      app.stage.removeChild(currentCountdownNumber);
    }
  }

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

function navigateToGameRoom(roomId) {
  document.getElementById("lobby-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "flex";
  // document.getElementById("room-id").innerHTML = roomId;
  // document.getElementById("user-you").innerHTML = username;
  document.getElementsByTagName("header")[0].style.display = "none";
  canvasRectangle = document.getElementById("canvas-container").getBoundingClientRect();
}

function login() {
  const username = document.getElementById("username-input").value;
  ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.ACCOUNT, ACCOUNT_ENUM.LOGIN, clientId, username)));
}

function sendMessage() {
  const message = document.getElementById("message-content").value;
  document.getElementById("message-content").value = "";
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

    messageWrapper.classList.add("chat-message");
    messageSender.classList.add("mr-1");
    messageContent.classList.add("message");

    messageSender.innerHTML = m.senderUsername;
    messageContent.innerHTML = m.message;

    messageWrapper.appendChild(messageSender);
    messageWrapper.appendChild(messageContent);
    parent.appendChild(messageWrapper);
  });
}

function displayRooms() {
  const parent = document.getElementById("rooms");

  while (parent.firstChild) {
    parent.removeChild(parent.lastChild);
  }

  rooms.forEach((r) => {
    const roomElement = document.createElement("li");
    const roomDisplayWrapper = document.createElement("div");
    const roomButton = document.createElement("button");
    const roomName = document.createElement("span");
    const roomUsers = document.createElement("span");

    const joinText = r.users.length === 2 ? "Full" : "Join";
    const buttonClass = r.users.length === 2 ? "error" : "success";
    roomName.innerHTML = r.name;

    roomUsers.innerHTML = `${r.users.length}/2`;
    roomButton.innerHTML = joinText;
    roomButton.classList.add(buttonClass);
    roomButton.onclick = () => {
      // sending a message that we are joining the room
      ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.ROOM, ROOM_ENUM.JOIN_ROOM, clientId, r.id)));
    };

    roomDisplayWrapper.classList.add("d-flex", "justify-space-between");
    roomDisplayWrapper.appendChild(roomName);
    roomDisplayWrapper.appendChild(roomUsers);
    roomElement.appendChild(roomDisplayWrapper);
    roomElement.appendChild(roomButton);
    parent.appendChild(roomElement);
  });
}
