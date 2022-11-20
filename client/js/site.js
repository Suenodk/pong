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
    JSON.stringify({
      type: MESSAGE_ENUM.CLIENT_MESSAGE,
      clientId: clientId,
      body: { ROOM_ENUM: ROOM_ENUM.CREATE_ROOM },
    })
  );
}
