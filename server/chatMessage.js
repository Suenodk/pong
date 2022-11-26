class ChatMessage {
  message;
  senderUsername;
  senderId;
  constructor(message, user) {
    this.message = message;
    this.senderUsername = user.username;
    this.senderId = user.id;
  }
}

module.exports = {
  ChatMessage,
};
