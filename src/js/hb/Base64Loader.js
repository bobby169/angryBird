class Base64Loader extends createjs.AbstractLoader{
  constructor(loadItem){
    super(loadItem)
    this.resultFormatter = this._formatResult;
    this._tag = createjs.Elements.img();
    this._formatImage(()=>{},() => {})
  }

  _formatResult (loader) {
    return this._formatImage;
  }
  _formatImage (successCallback, errorCallback) {
    let tag = this._tag;
    tag.src = this._item.src;

    if (tag.complete) {
      successCallback(tag);
    } else {
      tag.onload = createjs.proxy(function () {
        successCallback(this._tag);
        tag.onload = tag.onerror = null;
      }, this)
    }
  }
}

Base64Loader.canLoadItem = (item) => {
  return item.type === 'base64'
}
export default Base64Loader
