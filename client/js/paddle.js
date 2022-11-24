class Paddle {
  graphics;
  constructor(x, y) {
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(0xffffff);
    this.graphics.drawRect(0, 0, 200, 20);
    this.graphics.endFill();
    this.graphics.x = x;
    this.graphics.y = y;
    this.graphics.interactive = true;
    this.graphics.pivot.x = 100;
    this.graphics.pivot.y = 10;
    app.stage.addChild(this.graphics);
  }
}
