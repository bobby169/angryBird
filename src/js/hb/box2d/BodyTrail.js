class BodyTrail {
  constructor(parent, body, dotDistance = 20) {
    this.trailDistance = 10
    this.dotSize = 1
    this.body = body
    this.bodyPrePos = this.body.GetPosition().Copy()
    this.trailSprite = new createjs.Shape()
    parent.addChild(this.trailSprite)
    this.setTrailColor('#000000')
  }

  update() {
    this.drawDotTo(this.body.GetPosition())
  }

  setTrailColor(color) {
    this.trailColor = color
  }

  drawDotTo(bodyCurPos) {
    let b2Math = Box2D.Common.Math.b2Math
    this.trailSprite.graphics.setStrokeStyle(.5).beginStroke(this.trailColor)
    let distance = b2Math.Distance(bodyCurPos, this.bodyPrePos)
    let distanceVector
    while (distance > this.trailDistance / 30) {
      distanceVector = b2Math.SubtractVV(bodyCurPos, this.bodyPrePos)
      distanceVector.Multiply(this.trailDistance / 30 / distance)
      this.bodyPrePos.Add(distanceVector)

      let dotSize = Math.random() > 0.5 ? 2 : 1
      this.trailSprite.graphics.drawCircle(this.bodyPrePos.x * 30, this.bodyPrePos.y * 30, dotSize)
      this.trailSprite.graphics.endFill()

      distance = b2Math.Distance(bodyCurPos, this.bodyPrePos)
    }
  }
}

export default BodyTrail
