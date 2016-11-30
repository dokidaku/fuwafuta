(function (window) {
  var ctel = function (opt) {
    if (!(this instanceof ctel)) return new ctel(opt);
    opt = opt || {};
    opt.lineHeight = opt.lineHeight || 64;
    opt.width = opt.width || window.innerWidth || 1080;
    opt.height = opt.height || window.innerHeight || 720;
    opt.removeCallback = opt.removeCallback || undefined;
    this.opt = opt;
    this._rowTSpareR = [];
    this._rowTSpareL = [];
    this._rowBSpare = [];
    this._bulletsT = [];
    this._bulletsB = [];
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
    this._el.style.top = '0px';
    this._el.style.pointerEvents = 'none';
    this._el.style.background = 'none';
    this.updateSize();
  };

  ctel.prototype.getEl = function () { return this._el; };

  ctel.prototype.updateSize = function (w, h) {
    this.opt.width = w || this.opt.width;
    this.opt.height = h || this.opt.height;
    this._el.style.width = this.opt.width.toString() + 'px';
    this._el.style.height = this.opt.height.toString() + 'px';
    var cur_rows = Math.floor(this.opt.height / this.opt.lineHeight);
    while (this._rowTSpareR.length < cur_rows) this._rowTSpareR.push(-1);
    while (this._rowTSpareL.length < cur_rows) this._rowTSpareL.push(-1);
    while (this._rowBSpare.length < cur_rows) this._rowBSpare.push(-1);
  };

  ctel.prototype.emitTop = function (text, colour) {
    var el = window.document.createElement('div');
    this._el.appendChild(el);
    el.style.fontSize = '24px';
    el.style.color = colour || 'white';
    el.style.width = 'auto';
    el.textContent = text;
    el.style.position = 'absolute';
    el.style.pointerEvents = 'none';
    el.style.transition = 'left 10s linear';
    var x = this.opt.width + el.clientWidth;
    el.style.left = x.toString() + 'px';
    el.style.top = '0px';
    this._bulletsT.push(el);
    setTimeout((function (_el, _x) { return function () {
      _el.style.left = _x.toString() + 'px';
    }; }(el, -el.clientWidth)), 25);
    var transitionEndCallback = function (e) {
      e.target.parentNode.removeChild(e.target);
    };
    el.addEventListener('transitionend', transitionEndCallback);
    el.addEventListener('webkitTransitionend', transitionEndCallback);
  };

  window.ctel = ctel;
}(window));
