import CONST from './const'
import ResourceManager from './manager/ResourceManager'
import FactoryManager from './manager/FactoryManager'
import AddManager from './manager/AddManager'
import World from './World'
import 'createjs'

class Game {
  constructor(config, state) {
    this.config = null
    this.state = null
    this.create = null
    this.load = null
    this.canvas = null
    this.anim_container = null
    this.dom_overlay_container = null
    this.stage = null
    this.director = null
    this.lib = this.lib || {}

    this.delta = 0
    this.sdelta = 0
    this.width = 0
    this.height = 0
    this.exportRoot = null
    this.showfps = null
    this.debug = null
    this.lockRender = false
    this._initialize(config, state)
  }

  _initializeConfig(config) {
    if (!config) {
      config = CONST.DEFAULT_CONFIG
    } else {
      config = Object.assign({}, CONST.DEFAULT_CONFIG, config)
      if (typeof config.project !== 'string') {
        throw Error('Invalid project name. Please use a string.')
      } else if (!/^\w+$/i.test(config.project)) {
        throw Error('Invalid project name. Please only use letters, numbers and underscore')
      }

      config.debug = Boolean(config.debug)
      config.showfps = Boolean(config.showfps)
    }

    if (window.lib && window.lib.properties) {
      config = Object.assign({}, config, window.lib.properties)
    }

    this.config = config
    return config
  }

  _initializeState(state) {
    function isFunction(value) {
      return typeof value === 'function'
    }

    if (!state) state = {}
    if (!isFunction(state.boot)) delete state.boot
    if (!isFunction(state.preload)) delete state.preload
    if (!isFunction(state.create)) delete state.create
    if (!isFunction(state.update)) delete state.update
    if (!isFunction(state.draw)) delete state.draw

    this.state = state
  }

  _initialize(config, state) {
    config = this._initializeConfig(config)
    this._initializeState(state)
    this.width = config.width
    this.height = config.height
    let doc_canvas = document.getElementById(config.canvas)

    this.canvas = doc_canvas || document.createElement('canvas')
    this.canvas.width = config.width
    this.canvas.height = config.height
    this.canvas.style.backgroundColor = config.backgroundColor
    this.canvas.style.outline = 'none'
    this.canvas.style.position = 'absolute'
    this.canvas.setAttribute('tabindex', '0')
    this.canvas.addEventListener("mousedown", this.canvas.focus, false)

    this.dom_overlay_container = document.createElement('div')
    this.dom_overlay_container.className = 'overlay-container'
    this.dom_overlay_container.style.pointerEvents = 'none'
    this.dom_overlay_container.style.overflow = 'hidden'
    this.dom_overlay_container.style.width = config.width + 'px'
    this.dom_overlay_container.style.height = config.height + 'px'
    this.dom_overlay_container.style.position = 'absolute'
    this.dom_overlay_container.style.left = '0px'
    this.dom_overlay_container.style.top = '0px'
    this.dom_overlay_container.style.display = 'block'

    if (!config.canvas || !doc_canvas) {
      this.anim_container = document.getElementById(config.container) || document.body
      this.anim_container.style.backgroundColor = config.backgroundColor
      this.anim_container.appendChild(this.canvas)
      this.anim_container.appendChild(this.dom_overlay_container)
      this.canvas.focus()
    }
    if (config.showfps) {
      this.showfps = document.createElement('div')
      this.showfps.style.border = '1px solid #fff'
      this.showfps.style.background = 'rgba(0,0,0,.5)'
      this.showfps.style.color = '#fff'
      this.showfps.style.position = 'absolute'
      this.showfps.style.top = 0
      this.showfps.style.left = 0
      this.showfps.style.padding = '5px'
      this.showfps.style.zIndex = 9999
      this.anim_container.appendChild(this.showfps)
    }

    this.stage = new createjs.Stage(this.canvas)
    this.stage.snapToPixelEnabled = true
    createjs.Ticker.framerate = config.fps
    createjs.Touch.enable(this.stage)
    createjs.Sound.initializeDefaultPlugins()

    this.load = new ResourceManager(this)
    this.make = new FactoryManager(this)
    this.add = new AddManager(this)
    this.world = new World(this)

    // if(hb.DEBUG){
    //   this.debug = new hb.Debug(this)
    // }

    this._started = false

    //这样可以直接在构造函数参数中使用实例对象
    setTimeout(() => {
      this._boot()
    }, 0)
  }

  _boot() {
    if (this.state.boot) this.state.boot(this)
    if (this.world.boot) this.world.boot(this)

    createjs.Ticker.on('tick', this._onTick, this)
    this._preload()
  }

  _preload() {
    if (this.state.preload) this.state.preload(this)

    if (this.load.isFinished() /*&& !this.config.resources.manifest*/) {
      this._create()

    } else {
      this.load.on('complete', this._create, this)
      this.load.load()
    }
  }

  _onTick(e) {
    this.delta = e.delta
    this.sdelta = e.delta / 1000
    this._mainLoop(e)
  }

  _create() {
    if (this.state.create) this.state.create(this)
    this._started = true
    let response = this.config.response
    if (Object.prototype.toString.call(response) === '[object Array]' && response.length >= 4) {
      this.makeResponsive(response[0], response[1], response[2], response[3])
    }
  }

  _update(e) {
    if (this._started && this.state.update) {
      this.state.update(this, e)
    }

    if (this.config.showfps) {
      this.showfps.innerHTML = Math.round(createjs.Ticker.getMeasuredFPS()) + " fps"
    }
  }


  _updateRender(e) {
    if (this.lockRender) {
      return
    }

    if (this.state.render) {
      this.state.render(e)
    }
  }

  _draw(e) {
    this.stage.update()
    if (this.state.draw) this.state.draw(this, e)
  }

  _mainLoop(e) {
    this._update(e)
    this._draw(e)
    this._updateRender(e)
  }
}

export default Game
