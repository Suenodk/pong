class Paddle {
  x;
  velocityX;
  left = false;
  right = false;
  user;
  constructor(x) {
    this.x = x;
  }

  update() {
    if (this.left) {
      this.velocityX = -3;
    } else if (this.right) {
      this.velocityX = 3;
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
