import  'createjs'
import CONST from '../const'

class FactoryManager {
  constructor(game) {
    this.game = game
  }

  _setAnchor(object, regX, regY) {
    let bounds = object.getBounds() || {}
    let w = bounds.width || 0
    let h = bounds.height || 0

    if (regX === CONST.LEFT) {
      object.regX = 0
    } else if (regX === CONST.CENTER) {
      object.regX = w / 2
    } else if (regX === CONST.RIGHT) {
      object.regX = w
    } else {
      object.regX = regX
    }

    if (regY === CONST.TOP) {
      object.regY = 0
    } else if (regY === CONST.CENTER) {
      object.regY = h / 2
    } else if (regY === CONST.BOTTOM) {
      object.regY = h
    } else {
      object.regY = regY
    }
  }

  _setProperties(object, properties) {
    for (let key in properties) {
      if (key === 'regX' || key === 'regY') continue
      object[key] = properties[key]
    }
    this._setAnchor(object, properties['regX'], properties['regY'])
  }

  _getResource(idOrData) {
    let resource = idOrData
    if (typeof idOrData === 'string') {
      resource = this.game.load.get(idOrData)
      if (!resource && !idOrData.startsWith('data:')) {
        throw Error('Resource "' + idOrData + '" couldn\'t be found.')
      }
    }

    return resource
  }

  bitmap(idOrData, properties) {
    let image = this._getResource(idOrData)
    let bitmap = new createjs.Bitmap(image)
    if (properties) this._setProperties(bitmap, properties)
    return bitmap
  }

  spritesheet(idOrData, properties) {
    let data = this._getResource(idOrData)
    let ss = new createjs.SpriteSheet(data)
    if (properties) this._setProperties(ss, properties)
    return ss
  }

  sprite2(idOrData, animation, properties) {
    let image = this._getResource(idOrData)
    let sprite = new createjs.Sprite(image, animation)
    if (properties) this._setProperties(sprite, properties)
    return sprite
  }


  sprite(type, idOrData, animation, properties) {
    return new hb.Sprite(this.game, type, idOrData, animation, properties)
  }

  group(properties) {
    let sprite = new hb.Sprite(this.game, properties)
    sprite.type = 'group'
    sprite.physicsType = CONST.GROUP
    return sprite
  }

  tilemap(idOrData, properties) {
    let data = this._getResource(idOrData)
    let map = new hb.tmx.Map(data)
    if (properties) this._setProperties(map, properties)
    return map
  }

  bitmaptext(idOrData, text, properties) {
    let image = this._getResource(idOrData)
    let bitmap = new createjs.BitmapText(text, image)
    if (properties) this._setProperties(bitmap, properties)
    return bitmap
  }

  text(text, properties) {
    let obj = new createjs.Text(text)
    if (properties) this._setProperties(obj, properties)
    return obj
  }

  shape(properties) {
    let shape = new createjs.Shape()
    if (properties) this._setProperties(shape, properties)
    return shape
  }

  circle(r, color, properties) {
    let shape = new createjs.Shape()
    shape.graphics.f(color || 'white').dc(0, 0, r)
    if (properties) this._setProperties(shape, properties)
    return shape
  }

  box(w, h, color, properties) {
    let shape = new createjs.Shape()
    shape.graphics.f(color || 'white').r(-w / 2, -h / 2, w, h)
    if (properties) this._setProperties(shape, properties)
    return shape
  }
}

export default FactoryManager
