const screenWidth = 600;
const screenHeight = 800;

let app = new PIXI.Application({ width: screenWidth, height: screenHeight });
document.getElementById("canvas-container").appendChild(app.view);

const bottomPaddle = new Paddle(screenWidth / 2 - 100, screenHeight - 50);
const topPaddle = new Paddle(screenWidth / 2 - 100, 30);
const ball = new Ball(screenWidth / 2, screenHeight / 2);

app.ticker.add((delta) => {
  // topPaddle.update();
  // bottomPaddle.update();
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
  document.getElementById("game-screen").style.display = "block";
  document.getElementById("room-id").innerHTML = roomId;
  document.getElementById("user-you").innerHTML = username;
  document.getElementsByTagName("header")[0].style.display = "none";
}

function login() {
  ws = new WebSocket("wss://server-9i62.onrender.com");
  // ws = new WebSocket("ws://localhost:3000");
  ws.addEventListener("open", onOpenConnection);
  ws.addEventListener("close", onCloseConnection);
  ws.addEventListener("message", onMessage);
}

function displayRooms() {
  const parent = document.getElementById("rooms");

  while (parent.firstChild) {
    parent.removeChild(parent.lastChild);
  }

  rooms.forEach((r) => {
    const roomElement = document.createElement("li");
    const roomDisplay = document.createElement("div");
    const roomButton = document.createElement("button");

    roomDisplay.innerHTML = r.name;
    roomButton.innerHTML = "Join";
    roomButton.onclick = () => {
      // sending a message that we are joining the room
      ws.send(JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.ROOM, ROOM_ENUM.JOIN_ROOM, clientId, r.id)));
    };

    roomElement.appendChild(roomDisplay);
    roomElement.appendChild(roomButton);
    parent.appendChild(roomElement);
  });
}
