class Paddle {
  x;
  y;
  velocityX;
  left = false;
  right = false;
  width;
  height;
  user;
  speed;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  update() {
    if (this.left) {
      this.velocityX = -this.speed;
    } else if (this.right) {
      this.velocityX = this.speed;
    } else {
      this.velocityX = 0;
    }

    this.x += this.velocityX;
  }

  moveLeft() {
    this.left = true;
  }

  moveRight() {
    this.right = true;
  }

  stopMoveLeft() {
    this.left = false;
  }

  stopMoveRight() {
    this.right = false;
  }
}

module.exports = {
  Paddle,
};
