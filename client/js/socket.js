const MESSAGE_ENUM = Object.freeze({
  SELF_CONNECTED: "SELF_CONNECTED",
  CLIENT_CONNECTED: "CLIENT_CONNECTED",
  CLIENT_DISCONNECTED: "CLIENT_DISCONNECTED",
  CLIENT_MESSAGE: "CLIENT_MESSAGE",
});

const ROOM_ENUM = Object.freeze({
  JOIN_ROOM: "JOIN_ROOM",
  CREATE_ROOM: "CREATE_ROOM",
});

const GAME_UPDATE = Object.freeze({
  MOVE_LEFT: "MOVE_LEFT",
  MOVE_RIGHT: "MOVE_RIGHT",
  STOP_MOVE_LEFT: "STOP_MOVE_LEFT",
  STOP_MOVE_RIGHT: "STOP_MOVE_RIGHT",
});

let room = "";
let clientId = "";

ws = new WebSocket("ws://localhost:3000");
ws.onopen = (evt) => {
  ws.onmessage = (evt) => {
    let msg = JSON.parse(evt.data);
    switch (msg.type) {
      case MESSAGE_ENUM.CLIENT_MESSAGE:
        if (msg.actionType === ROOM_ENUM.JOIN_ROOM) {
          if (msg.sender === clientId) {
            room = msg.room;
            document.getElementById("room-id").innerHTML = room;
            document.getElementById("landing-screen").style.display = "none";
            document.getElementById("game-screen").style.display = "block";
          }
          break;
        } else if (msg.room === room) {
          topPaddle.graphics.x = msg.body.gameState.topPaddle.x;
          bottomPaddle.graphics.x = msg.body.gameState.bottomPaddle.x;
        }
        break;
      case MESSAGE_ENUM.CLIENT_CONNECTED:
        console.log(`${msg.body.name} has joined the chat.`);
        break;
      case MESSAGE_ENUM.CLIENT_DISCONNECTED:
        console.log(`${msg.body.name} has left the chat.`);
        break;
      case MESSAGE_ENUM.SELF_CONNECTED:
        room = msg.body.room;
        clientId = msg.body.clientId;
        document.getElementById("room-id").innerHTML = room;
        break;
      default:
        square.x = msg.x;
        square.y = msg.y;
        console.log("Unknown message type.", msg);
    }
  };
};
