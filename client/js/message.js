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

class ClientMessage extends Message {
    constructor(messageObject) {
        super(messageObject.eventType, messageObject.category, messageObject.message, messageObject.senderId, messageObject.data, messageObject.success);
    }
}