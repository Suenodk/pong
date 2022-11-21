const screenWidth = 600;
const screenHeight = 800;

let app = new PIXI.Application({ width: screenWidth, height: screenHeight });
document.getElementById("canvas-container").appendChild(app.view);

var square = new PIXI.Graphics();
square.beginFill(0xff0000);
square.drawRect(0, 0, 50, 50);
square.endFill();
square.x = 100;
square.y = 100;
square.interactive = true;
app.stage.addChild(square);

class Paddle {
  graphics;
  constructor(x, y) {
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(0xffffff);
    this.graphics.drawRect(0, 0, 200, 20);
    this.graphics.endFill();
    this.graphics.x = x;
    this.graphics.y = y;
    this.graphics.interactive = true;
    app.stage.addChild(this.graphics);
  }
}

const bottomPaddle = new Paddle(screenWidth / 2 - 100, screenHeight - 50);
const topPaddle = new Paddle(screenWidth / 2 - 100, 30);

app.ticker.add((delta) => {
  // topPaddle.update();
  // bottomPaddle.update();
});

square.on("mousedown", function (e) {
  ws.send(
    JSON.stringify({
      type: MESSAGE_ENUM.CLIENT_MESSAGE,
      room: room,
      clientId: clientId,
      body: { GAME_UPDATE: GAME_UPDATE.MOVE_LEFT },
    })
  );
});

onkeydown = (e) => {
  switch (e.key.toUpperCase()) {
    case "ARROWLEFT": {
      ws.send(
        JSON.stringify({
          type: MESSAGE_ENUM.CLIENT_MESSAGE,
          room: room,
          clientId: clientId,
          body: { GAME_UPDATE: GAME_UPDATE.MOVE_LEFT },
        })
      );
      break;
    }
    case "ARROWRIGHT": {
      ws.send(
        JSON.stringify({
          type: MESSAGE_ENUM.CLIENT_MESSAGE,
          room: room,
          clientId: clientId,
          body: { GAME_UPDATE: GAME_UPDATE.MOVE_RIGHT },
        })
      );
      break;
    }
  }
};

onkeyup = (e) => {
  switch (e.key.toUpperCase()) {
    case "ARROWLEFT": {
      ws.send(
        JSON.stringify({
          type: MESSAGE_ENUM.CLIENT_MESSAGE,
          room: room,
          clientId: clientId,
          body: { GAME_UPDATE: GAME_UPDATE.STOP_MOVE_LEFT },
        })
      );
      break;
    }
    case "ARROWRIGHT": {
      ws.send(
        JSON.stringify({
          type: MESSAGE_ENUM.CLIENT_MESSAGE,
          room: room,
          clientId: clientId,
          body: { GAME_UPDATE: GAME_UPDATE.STOP_MOVE_RIGHT },
        })
      );
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
  ws.send(
    JSON.stringify(new Message(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.ROOM, ROOM_ENUM.CREATE_ROOM, clientId))
  );
}

function navigateToGameRoom(roomId) {
  document.getElementById("landing-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  document.getElementById("room-id").innerHTML = roomId;
}

function login() {
  ws = new WebSocket("ws://localhost:3000");
  ws.addEventListener('open', onOpenConnection);
  ws.addEventListener('close', onCloseConnection);
  ws.addEventListener('message', onMessage);
}

function displayRooms() {
  const parent = document.getElementById("rooms");

  while (parent.firstChild) {
    parent.removeChild(parent.lastChild);
  }

  rooms.forEach(r => {
    const roomElement = document.createElement("li");
    const roomDisplay = document.createElement("div");
    const roomButton = document.createElement("button");

    roomDisplay.innerHTML = r.name;
    roomButton.innerHTML = "Join";

    roomElement.appendChild(roomDisplay);
    roomElement.appendChild(roomButton);
    parent.appendChild(roomElement);
  });
}
