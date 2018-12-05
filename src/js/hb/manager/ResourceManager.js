import 'createjs'

class ResourceManager {
  constructor(game) {
    this.game = game
    this._cache = {}
    this._processQueue = []
    this.basePath = ''
    this._initializeConfig(game.config['resources'] || {})

    this._loader = new createjs.LoadQueue(false, this.basePath)
    this._loader.installPlugin(createjs.Sound)

    let manifest = game.config['resources']['manifest']
    if (Object.prototype.toString.call(manifest) === '[object Array]' && manifest.length) {
      this.manifest(manifest)
    }

    this._loader.on('complete', this._postProcess, this)
  }

  _initializeConfig(config) {
    if (config.basePath && typeof config.basePath === 'string') {
      this.basePath = config.basePath
      if (!this.basePath.endsWith('/')) {
        this.basePath += '/'
      }
    }
  }

  _postProcess() {
    for (let i = 0; i < this._processQueue.length; i++) {
      let toProcess = this._processQueue[i]
      let tempObject = this._loader.getResult(toProcess.id)

      switch (toProcess.type) {
        case 'spritesheet':
          toProcess.data['images'] = [tempObject]
          let finalObject = new createjs.SpriteSheet(toProcess.data)
          break
        case 'audio':
          if (toProcess.data && toProcess.data.group) {
            this.game.sound.add(toProcess.id, toProcess.data.group)
          }
          break
        case 'audiosprite':
          if (toProcess.data) {
            let data = toProcess.data
            for (let j = 0; j < data.length; j++) {
              let d = data[j]
              if (d.group) {
                this.game.sound.add(d.id, d.group)
              }
            }
          }
          break
      }

      if (finalObject) {
        this._cache[toProcess.id] = finalObject
      }
    }
  }

  on(event, callback, context) {
    this._loader.on(event, callback, context)
  }

  off(event, callback) {
    this._loader.off(event, callback)
  }

  load() {
    this._loader.load()
  }

  get(id) {
    if (typeof this._cache[id] !== 'undefined') {
      return this._cache[id]
    }
    return this._loader.getResult(id)
  }

  isFinished() {
    return this._loader._numItems === this._loader._numItemsLoaded
  }

  image(id, src) {
    if (src.indexOf('data:image') > -1) {
      let image = new Image()
      image.src = src
      image.onload = () => {
        this._loader._loadItemsById[id] = {id: id, src: image}
        this._loader._loadedResults[id] = image
      }
    } else {
      this._loader.loadFile({id: id, src: this.basePath + src, type: 'image'}, false)//这里最后一个参数都是false，就是不立即执行load，最后执行game.load()方法时开始加载
    }
  }

  spritesheet(id, src, data) {
    if (typeof src === 'string' && src.endsWith('.json')) {
      this._loader.loadFile({id: id, src: this.basePath + src, type: 'spritesheet'}, false)
    } else {
      this._loader.loadFile({id: id, src: this.basePath + src, data: data}, false)
      this._processQueue.push({id: id, data: data, type: 'spritesheet'})
    }
  }

  audio(id, src, dat) {
    this._loader.loadFile({id: id, src: this.basePath + src}, false)
    this._processQueue.push({id: id, data: data, type: 'audio'})
  }

  audiosprite(id, src, dat) {
    this._loader.loadFile({id: id, src: this.basePath + src}, false)
    let _data = []
    for (let i = 0; i < data.length; i++) {
      let d = data[i]
      _data.push({id: d.id, startTime: d.start, duration: d.duration})
    }
    this._processQueue.push({id: id, data: data, type: 'audiosprite'})

    createjs.Sound.registerSounds([{src: this.basePath + src, data: {audioSprite: _data}}], '')
  }

  json(id, src) {
    this._loader.loadFile({id: id, src: this.basePath + src}, false)
  }

  script(id, sr) {
    this._loader.loadFile({id: id, src: this.basePath + src}, false)
  }

  css(id, src) {
    this._loader.loadFile({id: id, src: this.basePath + src}, false)
  }

  manifest(data) {
    for (let i = 0; i < data.length; i++) {
      let d = data[i]
      if (d.type === 'audio') {
        this.audio(d.id, d.src, d.data)
      } else if (d.type === 'audiosprite') {
        this.audiosprite(d.id, d.src, d.data)
      } else if (d.type === 'spritesheet') {
        this.spritesheet(d.id, d.src, d.data)
      } else {
        this.raw(d)
      }
    }
    this._loader.loadManifest(data, false)
  }

  raw(itemData) {
    this._loader.loadFile(itemData, false)
  }

}

export default ResourceManager
