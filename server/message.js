const { EVENT_TYPE_ENUM, CATEGORY_ENUM } = require("./constants");

class Message {
  eventType;
  category;
  message;
  senderId;
  data;
  success;
  constructor(eventType, category, message, senderId, data, success) {
    this.eventType = eventType;
    this.category = category;
    this.message = message;
    this.senderId = senderId;
    this.data = data;
    this.success = success;
  }
}

class ServerMessage extends Message {
  constructor(eventType, category, message, senderId, data) {
    super(eventType, category, message, senderId, data);
  }
}

class SuccesServerMessage extends Message {
  constructor(eventType, category, message, senderId, data) {
    super(eventType, category, message, senderId, data, true);
  }
}

class FailedServerMessage extends Message {
  constructor(eventType, category, message, senderId, data) {
    super(eventType, category, message, senderId, data, false);
  }
}

class ClientMessage extends Message {
  constructor(messageObject) {
    super(
      messageObject.eventType,
      messageObject.category,
      messageObject.message,
      messageObject.senderId,
      messageObject.data
    );
  }
}

class ErrorMessage extends Message {
  constructor(message) {
    super(EVENT_TYPE_ENUM.CLIENT_MESSAGE, CATEGORY_ENUM.ERROR, message);
  }
}

module.exports = {
  Message,
  ServerMessage,
  ClientMessage,
  ErrorMessage,
  SuccesServerMessage,
  FailedServerMessage
};
