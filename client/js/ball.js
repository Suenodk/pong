class Ball {
  graphics;
  constructor(x, y) {
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(0xffffff);
    this.graphics.drawCircle(0, 0, 20);
    this.graphics.endFill();
    this.graphics.x = x;
    this.graphics.y = y;
    this.graphics.interactive = true;
    app.stage.addChild(this.graphics);
  }
}
