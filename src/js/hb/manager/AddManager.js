class AddManager {
  constructor (game) {
    this.game = game
  }

  existing (object) {
    return this.world.add(object)
  }

  bitmap (idOrData, properties, group) {
    if (group === undefined) {
      group = this.world
    }
    return group.addChild(game.make.bitmap(idOrData, properties))
  }

  spritesheet (idOrData, properties, group) {
    if (group === undefined) {
      group = this.world
    }
    return group.addChild(game.make.spritesheet(idOrData, properties))
  }

  sprite2 (idOrData, animation, properties, group) {
    if (group === undefined) {
      group = this.world
    }
    return group.addChild(game.make.sprite2(idOrData, animation, properties))
  }

  sprite (key, idOrData, animation, properties, group) {
    if (group === undefined) {
      group = this.world
    }
    return group.addChild(game.make.sprite(key, idOrData, animation, properties))
  }


  group (properties, group) {
    if (group === undefined) {
      group = this.world
    }
    let sprite = new hb.Sprite(this.game,properties)
    sprite.type = 'group'
    sprite.physicsType = hb.GROUP
    return group.addChild(sprite)
  }

  bitmaptext (idOrData, text, properties, group) {
    if (group === undefined) {
      group = this.world
    }
    return group.addChild(game.make.bitmaptext(idOrData, text, properties))
  }

  text (text, properties, group) {
    if (group === undefined) {
      group = this.world
    }
    return group.addChild(game.make.text(text, properties))
  }

  shape (properties, group) {
    if (group === undefined) {
      group = this.world
    }
    return group.addChild(game.make.shape(properties))
  }

  circle (r, color, properties, group) {
    if (group === undefined) {
      group = this.world
    }
    return group.addChild(game.make.circle(r, color, properties))
  }

  box (w, h, color, properties, group) {
    if (group === undefined) {
      group = this.world
    }
    return group.addChild(game.make.box(w, h, color, properties))
  }
}

export default AddManager
