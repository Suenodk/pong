const { GameState } = require("./gameState");

class Room {
  id;
  name;
  users = [];
  // lobby room now also has a gamestate, we want to apply this only to game rooms later on
  gameState;

  constructor(id) {
    this.id = id;
    this.name = id;
  }

  removeUser(user) {
    this.users = this.users.filter(u => u.id !== user.id);
  }

  addUser(user) {
    this.users.push(user);
  }

  userInRoom(user) {
    return this.users.includes(user);
  }

  sendMessageToUsersInRoom(message) {
    this.users.forEach((u) => {
      u.socket.send(JSON.stringify(message));
    });
  }

  startGame() {
    this.gameState = new GameState(this.users[0], this.users[1]);
  }

  updateGame() {
    this.gameState.update();
  }

  processGameInput(user, gameEnum) {
    // if the game hasn't started yet we don't want to process input
    if(this.gameState === undefined)
      return;

    this.gameState.processGameInput(user, gameEnum);
  }
}

module.exports = {
  Room,
};
