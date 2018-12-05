import CONST from './const'

class Sprite extends createjs.Container {
  constructor (game, key, idOrData, animation, properties) {
    super()
    this.type = 'sprite'
    this.key = key
    this.game = game
    this.box2dBody = null//用来保存刚体信息,SetUserData
    this.properties = properties
    this.sprite = null
    this.exists = true
    this.fresh = true
    this.body = null
    this.regX = 0
    this.regY = 0
    this.physicsType = CONST.SPRITE
    this.hash = []

    if (key == 'bitmap') {
      this.properties = animation
      this.sprite = this.game.make.bitmap(idOrData)
      this.addChild(this.sprite)
    } else if (key == 'sprite') {
      this.sprite = this.game.make.sprite2(idOrData, animation)
      this.addChild(this.sprite)
    }else if(key && typeof key == 'object'){
      this.properties = key
    }

    if(this.properties){
      this.set(this.properties)
    }

    this.on('tick',this._update)
  }

  setRotate (angle) {
    let s = this
    if (s.box2dBody) {
      s.box2dBody.SetAngle(Math.PI / 180 * angle)
    } else {
      s.rotation = angle
    }
  }

  _update () {
    let body = this.box2dBody
    if (!body) {
      return
    }
    let data = body.GetUserData()
    if (data) {
      let pos = body.GetPosition()
      let angle = body.GetAngle()
      this.x = pos.x * 30
      this.y = pos.y * 30
      this.rotation = 180 / Math.PI * angle
    }
  }

  addToHash (child) {
    if(this.type != 'group'){
      return
    }
    if (child.parent === this) {
      let index = this.hash.indexOf(child)

      if (index === -1) {
        this.hash.push(child)
        return true
      }
    }

    return false
  }

  removeFromHash (child) {
    if (child) {
      let index = this.hash.indexOf(child)

      if (index !== -1) {
        this.hash.splice(index, 1)
        return true
      }
    }

    return false
  }

  setAll (key, value) {
    key = key.split('.')
    for (let i = 0; i < this.hash.length; i++) {
      this.set(this.hash[i], key, value)
    }
  }
}

export default Sprite
