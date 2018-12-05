class World extends createjs.Container{
  constructor (game) {
    super ()
    this.bounds = new createjs.Rectangle(0, 0, game.width, game.height)
    this.game = game
  }

  boot () {
    this.game.stage.addChild(this)
  }
}

export default World
