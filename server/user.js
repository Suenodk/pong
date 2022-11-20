const { MESSAGE_ENUM } = require("./constants");

class User {
  socket;
  id;
  username;

  constructor(socket, id) {
    this.socket = socket;
    this.id = id;
  }

  subscribeToMessages() {
    ws.subscribe(MESSAGE_ENUM.CLIENT_CONNECTED);
    ws.subscribe(MESSAGE_ENUM.CLIENT_DISCONNECTED);
    ws.subscribe(MESSAGE_ENUM.CLIENT_MESSAGE);
  }

  unsubscribeToMessages() {
    
  }
}

module.exports = {
  User,
};
