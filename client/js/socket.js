const MESSAGE_ENUM = Object.freeze({
    SELF_CONNECTED: "SELF_CONNECTED",
    CLIENT_CONNECTED: "CLIENT_CONNECTED",
    CLIENT_DISCONNECTED: "CLIENT_DISCONNECTED",
    CLIENT_MESSAGE: "CLIENT_MESSAGE",
  });
  
  ws = new WebSocket("ws://127.0.0.1:7777/ws");
  ws.onopen = (evt) => {
    ws.onmessage = (evt) => {
      let msg = JSON.parse(evt.data);
      switch (msg.type) {
        case MESSAGE_ENUM.CLIENT_MESSAGE:
          square.x = msg.body.x;
          square.y = msg.body.y;
          break;
        case MESSAGE_ENUM.CLIENT_CONNECTED:
          console.log(`${msg.body.name} has joined the chat.`);
          break;
        case MESSAGE_ENUM.CLIENT_DISCONNECTED:
          console.log(`${msg.body.name} has left the chat.`);
          break;
        case MESSAGE_ENUM.SELF_CONNECTED:
            square.x = msg.body.x;
            square.y = msg.body.y;
          break;
        default:
          console.log("Unknown message type.", msg);
      }
    };
  };
  