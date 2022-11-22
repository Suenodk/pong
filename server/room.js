class Room {
  id;
  name;
  users = [];

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

  sendMessageToUsersInRoom(message) {
    this.users.forEach((u) => {
      u.socket.send(JSON.stringify(message));
    });
  }
}

module.exports = {
  Room,
};
