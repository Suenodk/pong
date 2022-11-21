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
}

module.exports = {
  Room,
};
