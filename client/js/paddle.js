class Paddle {
  graphics;
  constructor(x, y, w, h) {
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(0xffffff);
    this.graphics.drawRect(0, 0, w, h);
    this.graphics.endFill();
    this.graphics.x = x;
    this.graphics.y = y;
    this.graphics.interactive = true;
    this.graphics.pivot.x = w / 2;
    this.graphics.pivot.y = h / 2;
    app.stage.addChild(this.graphics);
  }
}
