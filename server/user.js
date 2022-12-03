const { EVENT_TYPE_ENUM } = require("./constants");

class User {
  socket;
  id;
  username;
  roomId;

  constructor(socket, id) {
    this.socket = socket;
    this.id = id;
    this.socket.id = id;
  }

  subscribeToMessages() {
    this.socket.subscribe(EVENT_TYPE_ENUM.CLIENT_CONNECTED);
    this.socket.subscribe(EVENT_TYPE_ENUM.CLIENT_DISCONNECTED);
    this.socket.subscribe(EVENT_TYPE_ENUM.CLIENT_MESSAGE);
  }

  unsubscribeToMessages() {}
}

module.exports = {
  User,
};
