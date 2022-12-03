class Ball {
  x;
  velocityX;
  velocityY;
  speed;
  radius;
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.radius = r;
  }

  update() {
    this.x += this.velocityX * this.speed;
    this.y += this.velocityY * this.speed;
  }
}

module.exports = {
  Ball,
};
