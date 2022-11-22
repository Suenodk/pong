const FRAME_RATE = 60;
const SCREEN_WIDTH = 600;
const SCREEN_HEIGHT = 800;
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// add an enum with Object.freeze for code safety
const EVENT_TYPE_ENUM = Object.freeze({
    SELF_CONNECTED: "SELF_CONNECTED",
    CLIENT_CONNECTED: "CLIENT_CONNECTED",
    CLIENT_DISCONNECTED: "CLIENT_DISCONNECTED",
    CLIENT_MESSAGE: "CLIENT_MESSAGE",
  });


  const CATEGORY_ENUM = Object.freeze({
    SERVER: "SERVER",
    ROOM: "ROOM",
    GAME: "GAME",
    ERROR: "ERROR",
  })
  
  const ROOM_ENUM = Object.freeze({
    JOIN_ROOM: "JOIN_ROOM",
    CREATE_ROOM: "CREATE_ROOM",
    LEAVE_ROOM: "LEAVE_ROOM",
    DELETE_ROOM: "DELETE_ROOM"
  });
  
  const GAME_UPDATE = Object.freeze({
    MOVE_LEFT: "MOVE_LEFT",
    MOVE_RIGHT: "MOVE_RIGHT",
    STOP_MOVE_LEFT: "STOP_MOVE_LEFT",
    STOP_MOVE_RIGHT: "STOP_MOVE_RIGHT",
  });
  
  const GAME_COMMANDS = [
    GAME_UPDATE.MOVE_LEFT,
    GAME_UPDATE.MOVE_RIGHT,
    GAME_UPDATE.STOP_MOVE_LEFT,
    GAME_UPDATE.STOP_MOVE_RIGHT,
  ];

module.exports = {
  FRAME_RATE,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  PORT,
  HOST,
  EVENT_TYPE_ENUM,
  ROOM_ENUM,
  GAME_UPDATE,
  GAME_COMMANDS,
  CATEGORY_ENUM
}