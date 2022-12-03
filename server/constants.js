const FRAME_RATE = 120;
// percentage of the view width and view height
// ratio is very important here must be the same as the client 8 wide by 9 high
const SCREEN_WIDTH = 80;
const SCREEN_HEIGHT = 90;
const PORT = process.env.PORT || 3000;
const ORIGIN = process.env.ORIGIN || "http://localhost:8080";
const HOST = "0.0.0.0";

// add an enum with Object.freeze for code safety
const EVENT_TYPE_ENUM = Object.freeze({
  SELF_CONNECTED: "SELF_CONNECTED",
  CLIENT_CONNECTED: "CLIENT_CONNECTED",
  CLIENT_DISCONNECTED: "CLIENT_DISCONNECTED",
  CLIENT_MESSAGE: "CLIENT_MESSAGE",
});

const ACCOUNT_ENUM = Object.freeze({
  LOGIN: "LOGIN",
  LOGOUT: "LOGUT"
});
const CATEGORY_ENUM = Object.freeze({
  SERVER: "SERVER",
  ROOM: "ROOM",
  GAME: "GAME",
  ERROR: "ERROR",
  ACCOUNT: "ACCOUNT",
  CHAT: "CHAT"
});
const ROOM_ENUM = Object.freeze({
  JOIN_ROOM: "JOIN_ROOM",
  CREATE_ROOM: "CREATE_ROOM",
  LEAVE_ROOM: "LEAVE_ROOM",
  DELETE_ROOM: "DELETE_ROOM",
  JOIN_LOBBY: "JOIN_LOBBY"
});
const GAME_ENUM = Object.freeze({
  MOVE_LEFT: "MOVE_LEFT",
  MOVE_RIGHT: "MOVE_RIGHT",
  STOP_MOVE_LEFT: "STOP_MOVE_LEFT",
  STOP_MOVE_RIGHT: "STOP_MOVE_RIGHT",
  START_GAME: "START_GAME",
  UPDATE_GAME: "UPDATE_GAME",
  BLAST: "BLAST"
});
const CHAT_ENUM = Object.freeze({
  SEND_MESSAGE: "SEND_MESSAGE",
  RECEIVE_MESSAGE: "RECEIVE_MESSAGE"
});

module.exports = {
  FRAME_RATE,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  PORT,
  HOST,
  ORIGIN,
  EVENT_TYPE_ENUM,
  ROOM_ENUM,
  GAME_ENUM,
  CATEGORY_ENUM,
  ACCOUNT_ENUM,
  CHAT_ENUM
};
