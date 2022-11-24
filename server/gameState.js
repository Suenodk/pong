const { Ball } = require("./ball");
const { SCREEN_WIDTH, GAME_ENUM, SCREEN_HEIGHT } = require("./constants");
const { Paddle } = require("./paddle");

class GameState {
  topPaddle;
  bottomPaddle;
  ball;

  constructor(user1, user2) {
    this.topPaddle = new Paddle(SCREEN_WIDTH / 2, 40);
    this.bottomPaddle = new Paddle(SCREEN_WIDTH / 2, SCREEN_HEIGHT - 40);
    this.topPaddle.user = user1;
    this.bottomPaddle.user = user2;
    this.topPaddle.speed = this.bottomPaddle.speed = 5;
    // same as the client
    this.topPaddle.width = this.bottomPaddle.width = 200;
    this.topPaddle.height = this.bottomPaddle.height = 20;
    this.ball = new Ball(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
    this.ball.velocityX = Math.random() * 2 - 1;
    this.ball.velocityY = Math.random() < 0.5 ? -1 : 1;
    this.ball.speed = 3;
    // same as the client
    this.ball.radius = 20;
  }

  update() {
    this.topPaddle.update();
    this.bottomPaddle.update();
    this.ball.update();

    // bouncing against the top paddle
    if (
      this.ball.x - this.ball.radius < this.topPaddle.x + this.topPaddle.width / 2 &&
      this.ball.x + this.ball.radius > this.topPaddle.x - this.topPaddle.width / 2 &&
      this.ball.y - this.ball.radius < this.topPaddle.y + this.topPaddle.height / 2 &&
      this.ball.y + this.ball.radius > this.topPaddle.y - this.topPaddle.height / 2
    ) {
      this.ball.velocityY *= -1;
      this.ball.speed += 0.2;
    }

    // bouncing against the bottom paddle
    if (
      this.ball.x - this.ball.radius < this.bottomPaddle.x + this.bottomPaddle.width / 2 &&
      this.ball.x + this.ball.radius > this.bottomPaddle.x - this.bottomPaddle.width / 2 &&
      this.ball.y + this.ball.radius > this.bottomPaddle.y - this.bottomPaddle.height / 2 &&
      this.ball.y - this.ball.radius < this.bottomPaddle.y + this.bottomPaddle.height / 2
    ) {
      this.ball.velocityY *= -1;
      this.ball.speed += 0.2;
    }

    // bouncing against the left and right walls
    if (this.ball.x - this.ball.radius < 0) {
      this.ball.x = this.ball.radius;
      this.ball.velocityX *= -1;
    }

    if (this.ball.x + this.ball.radius > SCREEN_WIDTH) {
      this.ball.x = SCREEN_WIDTH - this.ball.radius;
      this.ball.velocityX *= -1;
    }
  }

  processGameInput(user, gameEnum) {
    const currentPaddle = this.#getPaddleAssociatedWithUser(user);
    switch (gameEnum) {
      case GAME_ENUM.MOVE_LEFT: {
        currentPaddle.moveLeft();
        break;
      }
      case GAME_ENUM.MOVE_RIGHT: {
        currentPaddle.moveRight();
        break;
      }
      case GAME_ENUM.STOP_MOVE_LEFT: {
        currentPaddle.stopMoveLeft();
        break;
      }
      case GAME_ENUM.STOP_MOVE_RIGHT: {
        currentPaddle.stopMoveRight();
        break;
      }
    }
  }

  #getPaddleAssociatedWithUser(user) {
    if (this.topPaddle.user === user) return this.topPaddle;
    if (this.bottomPaddle.user === user) return this.bottomPaddle;
  }
}

module.exports = {
  GameState,
};
