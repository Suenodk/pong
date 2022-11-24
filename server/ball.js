class Ball {
  x;
  velocityX;
  velocityY;
  speed;
  radius;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  update() {
    this.x += this.velocityX * this.speed;
    this.y += this.velocityY * this.speed;
  }
}

module.exports = {
  Ball,
};
