const { Room } = require("./room");
const { v4: uuidv4 } = require("uuid");
const { FRAME_RATE, EVENT_TYPE_ENUM, CATEGORY_ENUM, ROOM_ENUM, GAME_ENUM } = require("./constants");
const { ServerMessage } = require("./message");

class GameServer {
  users = [];
  gameRooms = [];
  lobbyRoom;

  constructor() {
    const roomId = this.#generateRoomId();
    this.lobbyRoom = new Room(roomId);
    this.lobbyRoom.name = "Lobby";
    console.log("Created lobby", this.lobbyRoom);
    this.gameRooms.push(this.lobbyRoom);
  }

  addUser(user) {
    this.users.push(user);
  }

  addUserToLobby(user) {
    user.roomId = this.lobbyRoom.id;
    this.#addUserToLobby(user);
  }

  logoutUser(userId) {
    const user = this.users.find((u) => u.id === userId);
    const index = this.users.indexOf(user);

    if (user !== undefined) {
      this.#removeUserFromRoom(user);
    }

    this.users.splice(index, 1);
  }

  createRoom(userId) {
    const user = this.users.find((u) => u.id === userId);

    if (user === undefined) {
      console.log(`User with id ${userId} was not found`);
      return;
    }

    const roomId = this.#generateRoomId();

    const room = new Room(roomId);
    this.#removeUserFromRoom(user);
    room.addUser(user);
    this.gameRooms.push(room);

    return room;
  }

  sendMessageToLobbyRoom(message) {
    this.lobbyRoom.sendMessageToUsersInRoom(message);
  }

  #removeUserFromRoom(user) {
    const currentRoom = this.gameRooms.find((r) => r.users.some((u) => u.id === user.id));

    if (currentRoom === undefined) {
      console.log(`Can't remove user from group ${user.id} is currently not in a group`);
      return;
    }

    currentRoom.removeUser(user);

    // if the user was in the lobbyroom we don't want to do anything anymore
    if (currentRoom === this.lobbyRoom) return;

    // otherwise we want to remove the room if it became empty or notify the other users that someone has left the room
    if (currentRoom.users.length === 0) {
      const index = this.gameRooms.indexOf(currentRoom);
      this.gameRooms.splice(index, 1);
      // first we check if we have an ongoing game if we do then we want to mark the game to be destroyed
      if(currentRoom.gameState !== undefined) {
        currentRoom.abandoned = true;
      }
      this.sendMessageToLobbyRoom(new ServerMessage(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.ROOM, ROOM_ENUM.DELETE_ROOM, "", currentRoom.id));
    } else {
      const message = new ServerMessage(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.ROOM, ROOM_ENUM.LEAVE_ROOM, "", user.id);
      currentRoom.sendMessageToUsersInRoom(message);
    }
  }

  #addUserToLobby(user) {
    this.lobbyRoom.addUser(user);
  }

  joinRoom(userId, roomId) {
    const user = this.users.find((u) => u.id === userId);
    const room = this.gameRooms.find((r) => r.id === roomId);

    this.#removeUserFromRoom(user);
    room.addUser(user);

    if (room != this.lobbyRoom && room.users.length === 2) {
      this.startRoom(room);
    }

    return room;
  }

  #generateRoomId() {
    const roomId = uuidv4().substring(0, 5);

    if (this.gameRooms.find((r) => r.id === roomId)) {
      return this.generateRoomId();
    } else {
      return roomId;
    }
  }

  startRoom(room) {
    let counter = 3;
    const intervalId = setInterval(() => {
      const startRoomMessage = new ServerMessage(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.GAME, GAME_ENUM.START_GAME, "", counter);

      // send the numbers 3, 2 and 1 to the client to render
      if(counter > 0)
        room.sendMessageToUsersInRoom(startRoomMessage);

      counter--;

      // then we wait another interval till the game starts
      if (counter === -1) {
        this.updateRoom(room);
        clearInterval(intervalId);
      }
    }, 1000);
  }

  updateRoom(room) {
    room.startGame();
    const intervalId = setInterval(() => {
      room.updateGame();
      if(room.abandoned) {
        clearInterval(intervalId);
      }
      const updateGameMessage = new ServerMessage(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.GAME, GAME_ENUM.UPDATE_GAME, "", room.gameState);
      room.sendMessageToUsersInRoom(updateGameMessage);
    }, 1000 / FRAME_RATE);
  }

  processGameInput(userId, gameEnum) {
    const user = this.users.find((u) => u.id === userId);
    const room = this.gameRooms.find((r) => r.userInRoom(user));

    // user is not in a game room, we don't need to proces anything
    if(room === undefined)
      return;

    room.processGameInput(user, gameEnum);
  }
}

module.exports = {
  GameServer,
};
