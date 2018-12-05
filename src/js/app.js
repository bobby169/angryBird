import hb from './hb'
import 'createjs'
import 'Box2D'
import './hb/box2d/B2d'
import B2d from './hb/box2d/B2d'
import BodyTrail from './hb/box2d/BodyTrail'

let box2d
hb.DEBUG = true
const game = new hb.Game({
  width: 1000,
  height: 500,
  showfps: true,
  response: false
}, {
  preload,
  create,
  update
})

/**
 * 加载资源
 */
function preload() {
  game.load.image('bg', require('!url-loader?mimetype=image/png!images/bg.png'))
  game.load.image('ground', require('images/ground.png'))
  game.load.image('bird', require('!url-loader?mimetype=image/png!images/bird-1.png'))
  game.load.image('desk', require('!url-loader?mimetype=image/png!images/desk.png'))
  game.load.image('wood1', require('!url-loader?mimetype=image/png!images/wood-1-1.png'))
  game.load.image('wood2', require('!url-loader?mimetype=image/png!images/wood-2-1.png'))
  game.load.image('wood3', require('!url-loader?mimetype=image/png!images/wood-3-1.png'))
  game.load.image('glass', require('!url-loader?mimetype=image/png!images/glass-1.png'))
  game.load.image('pig', require('!url-loader?mimetype=image/png!images/pig-1.png'))
  game.load.image('slingshot1', require('!url-loader?mimetype=image/png!images/slingshot-1.png'))
  game.load.image('slingshot2', require('!url-loader?mimetype=image/png!images/slingshot-2.png'))

  game.load.image('bowl', require('!url-loader?mimetype=image/png!images/bowl.png'))

  // let test = require('!url-loader?mimetype=image/png&limit=228192!images/bird-1.png')
}

/**
 * 创建带图形的sprite，sprite可以方便添加刚体
 * @param name
 * @param x
 * @param y
 * @param parent
 * @returns {*}
 */
function createBitmapSprite({name, x = 0, y = 0, parent = game.world}) {
  let sprite = new hb.Sprite()
  let bitmap = new createjs.Bitmap(game.load.get(name))
  bitmap.regX = bitmap.getBounds().width / 2
  bitmap.regY = bitmap.getBounds().height / 2
  sprite.name = name
  sprite.width = bitmap.getBounds().width
  sprite.height = bitmap.getBounds().height
  sprite.addChild(bitmap)
  sprite.set({x, y})
  parent.addChild(sprite)
  return sprite
}

/**
 * 创建带刚体的矩形障碍物
 * @param name
 * @param x
 * @param y
 * @param parent
 * @param rotate
 * @param density
 * @returns {*}
 */
function createBarriers({name, x, y, parent = game.world, rotate = 0, density}) {
  let sprite = createBitmapSprite({name, x, y, parent})
  sprite.addBodyPolygon(box2d, sprite.width, sprite.height, 1, density, 0.4, 0.2)
  sprite.setRotate(rotate)
  return sprite
}

/**
 * 测试不规则刚体，创建一个碗形的刚体
 * @param name
 * @param x
 * @param y
 * @param parent
 * @param rotate
 * @param density
 * @returns {*}
 */
function createBowl({name, x, y, parent = game.world, rotate = 0, density}) {
  let vertices = [[[486, 14], [455, 51], [446, 14]], [[39, 51], [16, 14], [47, 14]], [[486, 14], [486, 289], [454, 86], [455, 51]], [[39, 93], [16, 289], [16, 14], [39, 51]], [[51, 133], [16, 289], [39, 93]], [[77, 174], [16, 289], [51, 133]], [[104, 200], [16, 289], [77, 174]], [[136, 221], [16, 289], [104, 200]], [[193, 241], [16, 289], [136, 221]], [[193, 241], [246, 247], [486, 289], [16, 289]], [[486, 289], [449, 111], [454, 86]], [[486, 289], [430, 155], [449, 111]], [[486, 289], [416, 174], [430, 155]], [[486, 289], [395, 195], [416, 174]], [[486, 289], [364, 217], [395, 195]], [[486, 289], [330, 233], [364, 217]], [[486, 289], [284, 245], [330, 233]], [[486, 289], [246, 247], [284, 245]]]
  let sprite = new hb.Sprite()
  let bitmap = new createjs.Bitmap(game.load.get(name))
  sprite.name = name
  sprite.width = bitmap.getBounds().width
  sprite.height = bitmap.getBounds().height
  sprite.addChild(bitmap)
  sprite.set({x, y})
  parent.addChild(sprite)
  sprite.addBodyVertices(box2d, vertices, 0, 0, 1, density, 0.4, 0.2)
  sprite.setRotate(rotate)
  return sprite
}

/**
 * 资源加载完成
 */
function create() {
  box2d = new B2d([0, 10], false)
  setEvent()

  // 创建背景色
  let bgColor = new createjs.Shape()
  bgColor.graphics.beginFill("#94cddf").drawRect(0, 0, 1000, 500)
  //game.world.addChild(bgColor)

  // 创建背景图片
  let bg = new createjs.Bitmap(game.load.get('bg'))
  game.world.addChild(bg)

  // 创建地面
  let startX, startY, connection1, connection2
  let ground = new hb.Sprite()
  ground.set({x: 500, y: 375})
  ground.addBodyPolygon(box2d, 1000, 5, 0)
  game.world.addChild(ground)

  /* 测试不规则的刚体 begin*/
  // 创建小鸟
  /*
  let bird2 = createBitmapSprite({
    name: 'bird',
    x: 400,
    y: 100
  })
  bird2.addBodyCircle(box2d, bird2.width * 0.5, 1, 0, 1, .5, .4, .5)
  bird2.setBodyMouseJoint(true)
  createBowl({name: 'bowl', x: 250, y: 80, density: 300})
  return
  */
  /* 测试不规则的刚体 end*/

  // 创建障碍物
  createBarriers({name: 'desk', x: 740, y: 360, density: 10})
  createBarriers({name: 'desk', x: 850, y: 360, density: 10})
  createBarriers({name: 'wood1', x: 795, y: 330, density: 2})
  createBarriers({name: 'glass', x: 780, y: 300, rotate: 90, density: 1})
  createBarriers({name: 'glass', x: 810, y: 300, rotate: 90, density: 1})
  createBarriers({name: 'wood1', x: 795, y: 270, rotate: 2})
  createBarriers({name: 'wood3', x: 750, y: 290, rotate: 90, density: 3})
  createBarriers({name: 'wood3', x: 840, y: 290, rotate: 90, density: 3})
  createBarriers({name: 'wood3', x: 795, y: 230, density: 3})
  createBarriers({name: 'wood2', x: 795, y: 220, density: 1})
  createBarriers({name: 'pig', x: 795, y: 200, density: 3})
  createBarriers({name: 'wood3', x: 770, y: 180, rotate: 90, density: 3})
  createBarriers({name: 'wood3', x: 820, y: 180, rotate: 90, density: 3})
  createBarriers({name: 'wood1', x: 795, y: 120, density: 2})
  createBarriers({name: 'wood2', x: 795, y: 100, rotate: 90, density: 1})
  createBarriers({name: 'wood2', x: 695, y: 320, rotate: 90, density: 1})
  createBarriers({name: 'wood2', x: 895, y: 320, rotate: 90, density: 1})

  // 创建两条弹弓线条
  connection1 = new createjs.Shape().set({
    x: 270 - 13,
    y: 260,
    mouseEnabled: false
  })
  connection2 = new createjs.Shape().set({
    x: 270 + 13,
    y: 260 + 8,
    mouseEnabled: false
  })

  createBitmapSprite({name: 'slingshot1', x: 280, y: 310})

  game.world.addChild(connection2)

  // 创建小鸟
  let bird = createBitmapSprite({
    name: 'bird',
    x: 400,
    y: 360
  })

  // 此处注意addChild顺序
  game.world.addChild(connection1)
  createBitmapSprite({name: 'slingshot2', x: 264, y: 282})
  createBitmapSprite({name: 'ground', x: 500, y: 360})

  bird.yspeed = -5
  createjs.Tween.get(bird).to({x: 270, y: 260, yspeed: 5, delay: 1, rotation: -360}, 1000).call(function () {
    fly()
  }).on('change', function () {
    bird.y += bird.yspeed
  })

  function fly() {
    box2d.setEvent('postSolve', postSolve)
    startX = bird.x + bird.width / 2
    startY = bird.y + bird.height / 2
    game.world.on('mousedown', onStart)
  }

  function onStart(e) {
    if (e.stageX > bird.x && e.stageX < bird.x + bird.width &&
      e.stageY > bird.y && e.stageY < bird.y + bird.height) {
      game.world.removeEventListener('mousedown', onStart)
      game.world.addEventListener('pressmove', onMove)
      game.world.addEventListener('pressup', onEnd)
    }
  }

  function onEnd(e) {
    game.world.removeEventListener('pressup', onEnd)
    game.world.removeEventListener('pressmove', onMove)

    let startX2 = bird.x + bird.width * 0.5
    let startY2 = bird.y + bird.height * 0.5
    let r = Math.sqrt(Math.pow((startX - startX2), 2) + Math.pow((startY - startY2), 2))
    let angle = Math.atan2(startY2 - startY, startX2 - startX)

    bird.addBodyCircle(box2d, bird.width * 0.5, 0, 0, 1, 2, .4, .3)
    bird.setBodyMouseJoint(true)
    let force = 60
    let vec = new box2d.b2Vec2(-force * r * Math.cos(angle), -force * r * Math.sin(angle))
    //
    bird.box2dBody.ApplyForce(vec, bird.box2dBody.GetWorldCenter())

    // 创建小鸟飞行轨迹
    let trail = new BodyTrail(game.world, bird.box2dBody, 30)
    trail.setTrailColor('#00ff00')

    bird.on('tick', function () {
      trail.update()
    })

    bird.box2dBody.SetAngularVelocity(2)

    // 清除弹弓线条
    connection1.graphics.clear()
    connection2.graphics.clear()
  }

  function onMove(e) {
    let r = Math.sqrt(Math.pow((startX - e.localX), 2) + Math.pow((startY - e.localY), 2))
    if (r > 60) r = 60
    let angle = Math.atan2(e.localY - startY, e.localX - startX)
    bird.x = Math.cos(angle) * r + startX - bird.width * 0.5
    bird.y = Math.sin(angle) * r + startY - bird.height * 0.5
    drawLine(e)
  }

  /**
   * 碰撞检测，你可以自己实现小鸟与小猪碰撞后的处理
   * @param contact
   * @param impulse
   */
  function postSolve(contact, impulse) {
    //inpulse.normalImpulses[0]:垂直于碰撞面的冲量,碰撞后对碰撞物体所产生的伤害与冲量大小有关

    // console.info(contact,impulse)
    //碰撞检测
    if (contact.GetFixtureA().GetBody().GetUserData().hit) contact.GetFixtureA().GetBody().GetUserData().hit(impulse.normalImpulses[0])
    if (contact.GetFixtureB().GetBody().GetUserData().hit) contact.GetFixtureB().GetBody().GetUserData().hit(impulse.normalImpulses[0])
  }

  /**
   * 清除弹弓线
   * @param e
   */
  function drawLine(e) {
    connection1.graphics.clear().setStrokeStyle(10).s("#301708").mt(0, 0).lt(bird.x - 15 - connection1.x, bird.y + 10 - connection1.y)
    connection2.graphics.clear().setStrokeStyle(10).s("#301708").mt(0, 0).lt(bird.x - 15 - connection2.x, bird.y + 10 - connection2.y)
  }
}

/**
 * 画布定时更新
 */
function update() {
  box2d.update()
}

/**
 * 对box2d物体添加鼠标拾取事件
 */
function setEvent() {
  let isMouseDown = false
  game.stage.on('stagemousedown', function (e) {
    isMouseDown = true
    box2d.mouseJoint_start(e)
  })
  game.stage.on('stagemousemove', function (e) {
    if (!isMouseDown) {
      return
    }
    box2d.mouseJoint_move(e)
  })
  game.stage.on('stagemouseup', function (e) {
    box2d.mouseJoint_end(e)
    isMouseDown = false
  })
}
