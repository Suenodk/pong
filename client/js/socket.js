let room = "";
let clientId = "";
let username = "";

let ws = undefined;

let rooms = [];
let users = [];

function onOpenConnection() {
  console.log("connected to server!");
}

function onMessage(event) {
  console.log(event);
  const message = new ClientMessage(JSON.parse(event.data));
  console.log(message);

  switch (message.eventType) {
    case EVENT_TYPE_ENUM.CLIENT_MESSAGE:
      switch (message.category) {
        case CATEGORY_ENUM.ROOM: {
          if (message.message === ROOM_ENUM.CREATE_ROOM) {
            // we know that if the user id is our id we created the room
            // otherwise the room was created by someone else, we get this message if we are in the lobby
            if (message.senderId === clientId) {
              navigateToGameRoom(message.data.id);
            } else {
              rooms.push(message.data);
              displayRooms();
            }
          } else if (message.message === ROOM_ENUM.JOIN_ROOM) {
          } else if (message.message === ROOM_ENUM.DELETE_ROOM) {
            const room = rooms.find((r) => r.id === message.data);
            const roomIndex = rooms.indexOf(room);

            if (roomIndex !== -1) {
              rooms.splice(roomIndex, 1);
              displayRooms();
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
      clientId = message.data.userId;
      username = message.data.username;
      rooms = message.data.rooms;
      users = message.data.users;
      document.getElementById("landing-screen").style.display = "none";
      document.getElementById("lobby-screen").style.display = "flex";
      document.getElementById("username-display").innerHTML = username;
      displayRooms();
      break;
    default:
      square.x = msg.x;
      square.y = msg.y;
      console.log("Unknown message type.", msg);
  }
}

function onCloseConnection(event) {}
