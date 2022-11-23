const { SCREEN_WIDTH, GAME_ENUM } = require("./constants");
const { Paddle } = require("./paddle");

class GameState {
  topPaddle;
  bottomPaddle;

  constructor(user1, user2) {
    this.topPaddle = new Paddle(SCREEN_WIDTH / 2 - 100);
    this.bottomPaddle = new Paddle(SCREEN_WIDTH / 2 - 100);
    this.topPaddle.user = user1;
    this.bottomPaddle.user = user2;
  }

  update() {
    this.topPaddle.update();
    this.bottomPaddle.update();
  }

  processGameInput(user, gameEnum) {
    const currentPaddle = this.#getPaddleAssociatedWithUser(user)
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
