const screenWidth = 600;
const screenHeight = 800;

let app = new PIXI.Application({ width: screenWidth, height: screenHeight });
document.getElementById("canvas-container").appendChild(app.view);

var square = new PIXI.Graphics();
square.beginFill(0xff0000);
square.drawRect(0, 0, 50, 50);
square.endFill();
square.x = 100;
square.y = 100;
square.interactive = true;
app.stage.addChild(square);

square.on('mousedown', function (e) {
  ws.send(JSON.stringify({type: MESSAGE_ENUM.CLIENT_MESSAGE, body: "clicked"}));
});