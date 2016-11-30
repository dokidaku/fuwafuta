(function (window) {
  var ctel = function (opt) {
    if (!(this instanceof ctel)) return new ctel(opt);
    opt = opt || {};
    opt.lineHeight = opt.lineHeight || 64;
    opt.width = opt.width || window.innerWidth || 1080;
    opt.height = opt.height || window.innerHeight || 720;
    opt.removeCallback = opt.removeCallback || undefined;
    this.opt = opt;
    this.sayHello();
    this.initEl();
  };

  ctel.prototype.sayHello = function () {
    console.log('Hello from Cuddly Telegram');
  };

  ctel.prototype.initEl = function () {
    this._el = window.document.createElement('div');
    this._el.style.position = 'absolute';
    this._el.style.left = '0px';
    this._el.style.height = '0px';
    this._el.style.pointerEvents = 'none';
    this._el.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    this.updateSize();
  };

  ctel.prototype.getEl = function () { return this._el; };

  ctel.prototype.updateSize = function (w, h) {
    this.opt.width = w || this.opt.width;
    this.opt.height = h || this.opt.height;
    this._el.style.width = this.opt.width.toString() + 'px';
    this._el.style.height = this.opt.height.toString() + 'px';
  };

  window.ctel = ctel;
}(window));
