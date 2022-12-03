class Particle {
  graphics;
  velocityX;
  velocityY;
  speed;
  constructor(x, y, r) {
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(0xffffff);
    this.graphics.drawCircle(0, 0, 1);
    this.graphics.endFill();
    this.graphics.x = x;
    this.graphics.y = y;
    this.graphics.interactive = true;
    app.stage.addChild(this.graphics);
    this.graphics.scale.set(r, r);
    this.velocityX = Math.random() * 2 - 1;
    this.velocityY = Math.random() * 2 - 1;
    this.speed = Math.random() * 2 + 3;
  }
}
